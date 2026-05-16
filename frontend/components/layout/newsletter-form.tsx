"use client";

import { Button, InputGroup, InputGroupPrefix, InputGroupInput } from "@heroui/react";
import { Mail } from "lucide-react";
import { useState } from "react";

export function NewsletterForm({
  placeholder,
  cta,
}: {
  placeholder: string;
  cta: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
    window.setTimeout(() => setDone(false), 2400);
  };

  return (
    <div className="bg-background border border-border rounded-xl p-4">
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={submit}>
          <InputGroup className="flex-1 bg-card border border-border rounded-lg has-[input:focus]:border-warning [&_svg]:text-muted-foreground">
            <InputGroupPrefix className="ps-3">
              <Mail className="h-4 w-4" strokeWidth={2.2} />
            </InputGroupPrefix>
            <InputGroupInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </InputGroup>
          <Button
            type="submit"
            className="rounded-lg bg-warning text-warning-foreground font-semibold px-4 py-2.5 hover:opacity-90"
          >
            {done ? "✓" : cta}
          </Button>
        </form>
    </div>
  );
}
