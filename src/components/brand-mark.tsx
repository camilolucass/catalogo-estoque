import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("flex h-10 items-center", className)}>
      <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
        Controlador de Estoque
      </span>
    </div>
  );
}
