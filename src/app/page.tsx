import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
            aria-hidden="true"
          >
            <circle cx="6" cy="17" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="17" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M6 17L10 8H14M18 17L14 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-display text-xl font-bold">BikeLog</span>
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        Scaffold is up — Next.js, Tailwind, shadcn/ui, and the BikeLog theme
        are wired in. Auth and the real dashboard come next.
      </p>
      <ThemeToggle />
    </div>
  );
}
