import { cn } from "@/lib/utils";

export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export default function TypingIndicator({ className, size = "md", ...props }: TypingIndicatorProps) {
  const sizeClasses = {
    sm: "gap-1",
    md: "gap-1", 
    lg: "gap-2"
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3"
  };

  return (
    <div
      className={cn(
        "typing-indicator flex items-center",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div className={cn("typing-dot rounded-full", dotSizeClasses[size])}></div>
      <div className={cn("typing-dot rounded-full", dotSizeClasses[size])}></div>
      <div className={cn("typing-dot rounded-full", dotSizeClasses[size])}></div>
    </div>
  );
}
