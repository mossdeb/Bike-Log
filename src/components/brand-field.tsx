import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

// Native <datalist> — no client JS needed for suggest-as-you-type, and the
// input still submits as a plain form field. If BikeIndex is unreachable,
// `manufacturers` is just empty and this degrades to a free-text field.
export function BrandField({
  manufacturers,
  defaultValue,
  dict = getDictionary("en"),
  className,
  required,
}: {
  manufacturers: string[];
  defaultValue?: string | null;
  dict?: Dictionary;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor="brand">{dict.brandField.brand}</Label>
      <Input
        id="brand"
        name="brand"
        list="brand-suggestions"
        autoComplete="off"
        placeholder={dict.brandField.placeholder}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
      <datalist id="brand-suggestions">
        {manufacturers.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <p className="text-xs text-muted-foreground">
        {dict.brandField.hint} <span className="font-semibold text-foreground">BikeIndex.org</span>
      </p>
    </div>
  );
}
