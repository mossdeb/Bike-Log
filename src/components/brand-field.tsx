import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Native <datalist> — no client JS needed for suggest-as-you-type, and the
// input still submits as a plain form field. If BikeIndex is unreachable,
// `manufacturers` is just empty and this degrades to a free-text field.
export function BrandField({
  manufacturers,
  defaultValue,
}: {
  manufacturers: string[];
  defaultValue?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="brand">Brand</Label>
      <Input
        id="brand"
        name="brand"
        list="brand-suggestions"
        autoComplete="off"
        placeholder="Start typing a brand…"
        defaultValue={defaultValue ?? ""}
      />
      <datalist id="brand-suggestions">
        {manufacturers.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <p className="text-xs text-muted-foreground">
        Brand list from <span className="font-semibold text-foreground">BikeIndex.org</span>
      </p>
    </div>
  );
}
