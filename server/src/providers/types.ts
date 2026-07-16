export interface OutreachInput {
  businessName: string;
  industry: string;
  contactName?: string | null;
  city?: string | null;
}

export interface OutreachDraft {
  emailSubject: string;
  emailBody: string;
  letterBody: string;
}

export interface SiteCopyInput {
  businessName: string;
  industry: string;
  businessDescription: string;
  services: string[];
}

export interface SiteCopy {
  tagline: string;
  heroHeadline: string;
  aboutParagraph: string;
  services: { name: string; description: string }[];
}

export interface MarketingInput {
  businessName: string;
  industry: string;
  channel: "SOCIAL" | "EMAIL";
}

export interface MarketingPostDraft {
  content: string;
}

export interface LLMProvider {
  readonly name: string;
  draftOutreach(input: OutreachInput): Promise<OutreachDraft>;
  generateSiteCopy(input: SiteCopyInput): Promise<SiteCopy>;
  generateMarketingPost(input: MarketingInput): Promise<MarketingPostDraft>;
}

export interface EmailSendInput {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface SendResult {
  providerName: string;
  providerId: string;
}

export interface EmailProvider {
  readonly name: string;
  send(input: EmailSendInput): Promise<SendResult>;
}

export interface LetterSendInput {
  toName: string;
  addressLine1?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  bodyText: string;
}

export interface MailProvider {
  readonly name: string;
  sendLetter(input: LetterSendInput): Promise<SendResult>;
}

export interface DeployInput {
  slug: string;
  filePath: string;
}

export interface DeployResult {
  providerName: string;
  url: string;
}

export interface DeployProvider {
  readonly name: string;
  deploy(input: DeployInput): Promise<DeployResult>;
}
