import { createHmac, timingSafeEqual } from "node:crypto";

// Lob signs webhooks with HMAC-SHA256 over `${timestamp}.${rawBody}`, sent
// as the `Lob-Signature` header alongside `Lob-Signature-Timestamp`. Verify
// this against your LOB_WEBHOOK_SECRET (separate from LOB_API_KEY -- Lob
// issues it specifically for webhook signing) before trusting a payload.
export function verifyLobSignature(
  rawBody: Buffer,
  timestamp: string | undefined,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!timestamp || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf-8")}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

// Postmark secures inbound webhooks with HTTP Basic Auth configured on the
// webhook URL itself (not a request signature) -- verify the Authorization
// header against the username/password you set when configuring the
// webhook in the Postmark dashboard.
export function verifyPostmarkBasicAuth(
  authHeader: string | undefined,
  expectedUsername: string,
  expectedPassword: string,
): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const [username, password] = decoded.split(":");
  return username === expectedUsername && password === expectedPassword;
}

// Stripe signs webhooks as `Stripe-Signature: t=<timestamp>,v1=<signature>`,
// where signature = HMAC-SHA256(secret, `${timestamp}.${rawBody}`). Verify
// against STRIPE_WEBHOOK_SECRET before trusting an event.
export function verifyStripeSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => part.split("=") as [string, string]),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody.toString("utf-8")}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}
