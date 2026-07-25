import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-primary",
        className
      )}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        className="size-[18px] text-primary-foreground"
        aria-hidden="true"
      >
        <path
          d="M115.299 36.6795H83.3209V4.70155C76.1513 1.67446 68.2714 0 60 0C26.8631 0 0 26.8628 0 60C0 68.1375 1.62818 75.8928 4.56272 82.9687H37.0317V37.0312H82.9683V82.9687H37.0317V115.437C44.1075 118.372 51.8628 120 60 120C93.1376 120 120 93.1371 120 60C120 51.7287 118.326 43.8487 115.299 36.6795Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
