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
        viewBox="0 0 100 113"
        fill="none"
        className="size-[18px] text-primary-foreground"
        aria-hidden="true"
      >
        <path
          d="M71.4203 34.8425V10.8934L54.7614 1.27568C51.8155 -0.425225 48.1858 -0.425225 45.2399 1.27568L4.76077 24.6457C1.81483 26.3466 0 29.49 0 32.8917V77.681H28.581V34.8425H71.4203Z"
          fill="currentColor"
        />
        <path
          d="M71.4196 34.8429V77.6813H28.5803V101.63L45.2392 111.248C48.1851 112.949 51.8148 112.949 54.7607 111.248L95.2392 87.8781C98.1851 86.1773 100 83.0339 100 79.6321V34.8429H71.4196Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
