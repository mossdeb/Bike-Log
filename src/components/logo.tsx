import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5 text-primary-foreground"
        aria-hidden="true"
      >
        <circle cx="6" cy="17" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="18" cy="17" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M6 17L10 8H14M18 17L14 8M10 8L14 13.5H18L14 8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
