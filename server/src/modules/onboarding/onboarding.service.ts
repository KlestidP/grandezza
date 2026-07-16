import { db } from "../../db.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";

export interface OnboardingInput {
  businessDescription: string;
  services: string[];
  brandColors?: string;
}

export async function submitOnboarding(clientId: string, input: OnboardingInput) {
  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) throw new NotFoundError("Client");
  if (!input.businessDescription || !Array.isArray(input.services) || input.services.length === 0) {
    throw new BadRequestError("businessDescription and a non-empty services array are required");
  }

  const intake = await db.onboardingIntake.create({
    data: {
      clientId,
      businessDescription: input.businessDescription,
      servicesJson: JSON.stringify(input.services),
      brandColors: input.brandColors,
      rawFormJson: JSON.stringify(input),
    },
  });

  await db.client.update({
    where: { id: clientId },
    data: { onboardingStatus: "INTAKE_COMPLETE" },
  });

  return intake;
}
