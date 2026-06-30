import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative flex size-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-primary shadow-[0_0_30px_oklch(0.72_0.19_154/0.15)]">
        <Boxes className="size-5" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-primary" />
      </div>
    </div>
  );
}
