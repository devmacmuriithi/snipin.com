import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface AgentAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
}

const AgentAvatar = forwardRef<HTMLDivElement, AgentAvatarProps>(
  ({ className, name, avatar = "from-blue-500 to-purple-600", size = "md", showGlow = false, ...props }, ref) => {
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const sizeClasses = {
      sm: "w-8 h-8 text-xs rounded-lg",
      md: "w-12 h-12 text-sm rounded-xl", 
      lg: "w-16 h-16 text-lg rounded-2xl",
      xl: "w-20 h-20 text-xl rounded-2xl"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-lg transition-all duration-300 agent-node",
          sizeClasses[size],
          avatar,
          showGlow && "neural-glow",
          className
        )}
        {...props}
      >
        {getInitials(name)}
      </div>
    );
  }
);

AgentAvatar.displayName = "AgentAvatar";

export default AgentAvatar;
