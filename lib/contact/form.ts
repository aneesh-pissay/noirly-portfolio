/** Shared between the contact form (client) and its server action. */

export const PROJECT_TYPES = [
  "New product or MVP",
  "Web application",
  "Mobile app",
  "Help with an existing project",
  "Something else",
] as const;

export const BUDGETS = [
  "Not sure yet",
  "Under ₹1.5L",
  "₹1.5L – ₹4L",
  "₹4L – ₹12L",
  "₹12L+",
] as const;

export const LIMITS = {
  name: 100,
  email: 200,
  message: 5000,
  messageMin: 20,
} as const;

export type ContactField = "name" | "email" | "projectType" | "budget" | "message";

export interface ContactState {
  status: "idle" | "success" | "error";
  /** Form-level message shown above the submit button. */
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** Echoed back on error so nothing the visitor typed is lost. */
  values?: Partial<Record<ContactField, string>>;
}

export const INITIAL_CONTACT_STATE: ContactState = { status: "idle" };
