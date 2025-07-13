import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "subtle";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    const baseClasses = "rounded-3xl transition-all duration-300";
    
    const variantClasses = {
      default: "glass-morphism shadow-xl",
      elevated: "glass-card-elevated shadow-2xl",
      subtle: "bg-surface-secondary border border-border-subtle shadow-lg"
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
export default GlassCard;
