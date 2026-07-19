import { db } from "../../db.js";
import { env } from "../../env.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

// Uses Stripe's REST API directly (form-encoded, per Stripe's documented
// shape) rather than the stripe SDK -- consistent with the rest of this
// codebase's approach to third-party integrations (raw fetch, no extra
// dependency). Written against Stripe's public API docs; not exercised
// against a real Stripe account (no test key was available while building
// this) -- verify against a real STRIPE_SECRET_KEY before relying on it.
export async function createCheckoutSession(clientId: string) {
  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) throw new NotFoundError("Client");
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
    throw new BadRequestError(
      "Billing isn't configured yet -- set STRIPE_SECRET_KEY and STRIPE_PRICE_ID",
    );
  }

  const body = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": env.STRIPE_PRICE_ID,
    "line_items[0][quantity]": "1",
    success_url: `${env.PUBLIC_BASE_URL}/portal/${client.dashboardToken}?billing=success`,
    cancel_url: `${env.PUBLIC_BASE_URL}/portal/${client.dashboardToken}?billing=cancelled`,
    "metadata[clientId]": client.id,
  });
  if (client.email) body.set("customer_email", client.email);
  if (client.stripeCustomerId) {
    body.delete("customer_email");
    body.set("customer", client.stripeCustomerId);
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Stripe checkout session failed: ${res.status} ${await res.text()}`);
  }

  const session = (await res.json()) as { id: string; url: string };
  return { checkoutUrl: session.url };
}

interface StripeEvent {
  type: string;
  data: {
    object: {
      id: string;
      customer?: string;
      subscription?: string;
      metadata?: { clientId?: string };
      status?: string;
    };
  };
}

export async function handleStripeWebhookEvent(event: StripeEvent) {
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const clientId = obj.metadata?.clientId;
      if (!clientId) {
        logger.warn("Stripe checkout.session.completed with no clientId in metadata");
        return;
      }
      await db.client.update({
        where: { id: clientId },
        data: {
          billingStatus: "ACTIVE",
          stripeCustomerId: obj.customer,
          stripeSubscriptionId: obj.subscription,
        },
      });
      return;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const client = await db.client.findFirst({ where: { stripeSubscriptionId: obj.id } });
      if (!client) {
        logger.warn(`No client found for Stripe subscription ${obj.id}`);
        return;
      }
      const billingStatus =
        event.type === "customer.subscription.deleted"
          ? "CANCELED"
          : obj.status === "past_due"
            ? "PAST_DUE"
            : obj.status === "active"
              ? "ACTIVE"
              : client.billingStatus;
      await db.client.update({ where: { id: client.id }, data: { billingStatus } });
      return;
    }
    default:
      // Unhandled event types are expected and fine to ignore.
      return;
  }
}
