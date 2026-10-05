"use server";

import { headers } from "next/headers";
import {
  BUDGETS,
  LIMITS,
  PROJECT_TYPES,
  type ContactField,
  type ContactState,
} from "@/lib/contact/form";
import { sendEnquiry } from "@/lib/contact/mailer";

/** A human takes longer than this to fill the form; most bots do not. */
const MIN_FILL_MS = 2500;

/** Per-IP cap. In-memory, so it is per server instance — a speed bump for
 *  scripted floods, not a hard guarantee across a serverless fleet. */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const recent = new Map<string, number[]>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function field(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Single-line fields go into email headers, so newlines are never allowed. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ");
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (hits.length >= RATE_LIMIT.max) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  return false;
}

export async function submitContact(
  _prev: ContactState,
  form: FormData,
): Promise<ContactState> {
  const values: Record<ContactField, string> = {
    name: oneLine(field(form, "name")),
    email: oneLine(field(form, "email")),
    projectType: field(form, "projectType"),
    budget: field(form, "budget"),
    message: field(form, "message"),
  };

  // Honeypot: only bots fill the hidden field. Answer as if it worked.
  if (field(form, "website")) {
    return { status: "success" };
  }

  const fieldErrors: ContactState["fieldErrors"] = {};
  if (!values.name) fieldErrors.name = "Please tell me your name.";
  else if (values.name.length > LIMITS.name) fieldErrors.name = "That name is a little long.";

  if (!EMAIL_RE.test(values.email) || values.email.length > LIMITS.email) {
    fieldErrors.email = "Please enter a valid email so I can reply.";
  }

  if (!(PROJECT_TYPES as readonly string[]).includes(values.projectType)) {
    fieldErrors.projectType = "Please choose what you need help with.";
  }

  if (values.budget && !(BUDGETS as readonly string[]).includes(values.budget)) {
    values.budget = "";
  }

  if (values.message.length < LIMITS.messageMin) {
    fieldErrors.message = `A few more details, please — at least ${LIMITS.messageMin} characters.`;
  } else if (values.message.length > LIMITS.message) {
    fieldErrors.message = `Please keep it under ${LIMITS.message} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  // Timing trap, judged only after validation: a person who hits Send early
  // on an incomplete form must see their errors, not a fake "Thanks" that
  // silently drops the message. A *valid* form filled faster than a person
  // could type is a bot — answer as if it worked, so there is nothing to learn.
  // `startedAt` is only judged when present: it is set by script after
  // hydration, so a real person who submits before the page's JavaScript has
  // loaded (or with it off) sends none — and must not be silently dropped.
  const startedAt = Number(field(form, "startedAt"));
  if (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "success" };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return {
      status: "error",
      message: "You've sent a few messages already — please try again in a little while.",
      values,
    };
  }

  try {
    await sendEnquiry(values);
  } catch (error) {
    console.error("[contact] failed to send enquiry", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again, or email me directly.",
      values,
    };
  }

  return { status: "success" };
}
