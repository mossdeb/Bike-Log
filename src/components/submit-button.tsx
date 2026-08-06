"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

/**
 * A submit button that goes inert while its form's action is in flight.
 *
 * Nothing else stopped a second click landing before the server action
 * redirected, and on a create form a second click is a second record. That
 * happened: two identical components, 1.8 seconds apart, down to the same
 * install date and baseline.
 *
 * useFormStatus reports on the nearest enclosing form, so this has to be
 * rendered inside the <form> it belongs to — passing it alongside one would
 * leave `pending` permanently false and the guard silently absent.
 */
export function SubmitButton({
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" disabled={disabled || pending}>
      {children}
    </Button>
  );
}
