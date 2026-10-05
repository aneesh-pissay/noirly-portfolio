"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, LoaderCircle } from "lucide-react";
import { Input, Label, Textarea } from "@noirly-dev/ui";
import { submitContact } from "@/app/actions/contact";
import {
  BUDGETS,
  INITIAL_CONTACT_STATE,
  LIMITS,
  PROJECT_TYPES,
  type ContactField,
} from "@/lib/contact/form";

const selectClass =
  "flex h-10 w-full appearance-none rounded-xl border border-[var(--hairline)] bg-[var(--surface)] py-2 pr-9 pl-3 text-base text-[var(--foreground)] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-[var(--destructive)]">
      {message}
    </p>
  );
}

export function ContactForm({ email }: { email: { label: string; href: string } }) {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL_CONTACT_STATE);
  // When the form appeared — the server rejects submissions faster than a
  // person could type (see MIN_FILL_MS in the action).
  const [startedAt, setStartedAt] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStartedAt(String(Date.now()));
  }, []);

  // Move focus to the result so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-center px-6 py-12 text-center outline-none"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline-strong)] text-[var(--accent)]">
          <Check size={20} aria-hidden />
        </span>
        <p className="display-md mt-5 text-[var(--text)]">Thanks — your message is on its way.</p>
        <p className="copy mt-2 max-w-md">
          I&apos;ll read it and reply to the email you gave. If it&apos;s urgent, you can also reach
          me at{" "}
          <a href={email.href} className="underline underline-offset-4">
            {email.label}
          </a>
          .
        </p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const describe = (name: ContactField) => (errors[name] ? `${name}-error` : undefined);

  return (
    // `key` remounts the fields with the echoed values after a failed submit,
    // because React resets an action form once the action settles.
    <form
      key={JSON.stringify(values)}
      action={formAction}
      noValidate
      className="relative grid grid-cols-1 gap-5 p-6 text-left sm:grid-cols-2 md:p-8"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={LIMITS.name}
          defaultValue={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describe("name")}
          className="mt-2"
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={LIMITS.email}
          defaultValue={values.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={describe("email")}
          className="mt-2"
        />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div>
        <Label htmlFor="projectType">What do you need?</Label>
        <div className="relative mt-2">
          <select
            id="projectType"
            name="projectType"
            required
            defaultValue={values.projectType ?? ""}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={describe("projectType")}
            className={selectClass}
          >
            <option value="" disabled>
              Choose one
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)]"
          />
        </div>
        <FieldError id="projectType-error" message={errors.projectType} />
      </div>

      <div>
        <Label htmlFor="budget">
          Budget <span className="text-[var(--text-muted)]">(optional)</span>
        </Label>
        <div className="relative mt-2">
          <select
            id="budget"
            name="budget"
            defaultValue={values.budget ?? ""}
            className={selectClass}
          >
            <option value="">Prefer not to say</option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)]"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="message">Tell me about the project</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          minLength={LIMITS.messageMin}
          maxLength={LIMITS.message}
          defaultValue={values.message}
          placeholder="What are you building, who is it for, and when do you need it?"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe("message")}
          className="mt-2"
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      {/* Bot traps: a field people never see, and the time the form opened. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <div ref={statusRef} tabIndex={-1} role="alert" className="text-sm outline-none">
          {state.status === "error" && state.message ? (
            <p className="text-[var(--destructive)]">
              {state.message}{" "}
              <a href={email.href} className="underline underline-offset-4">
                {email.label}
              </a>
            </p>
          ) : (
            <p className="text-[var(--text-muted)]">Your details are only used to reply to you.</p>
          )}
        </div>

        <button type="submit" disabled={pending} className="btn btn-solid shrink-0 disabled:opacity-60">
          {pending ? (
            <>
              Sending
              <LoaderCircle size={14} aria-hidden className="animate-spin" />
            </>
          ) : (
            <>
              Send message
              <ArrowUpRight size={14} aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
