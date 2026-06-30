import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-deep-teal text-white hover:bg-teal-dark",
    secondary: "bg-cream-dark text-text-dark hover:bg-cream-dark/80",
    destructive: "bg-red-50 text-red-700 border border-red-200/50",
    success: "bg-green-50 text-green-700 border border-green-200/50",
    warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    outline: "text-foreground border border-text-dark/20"
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
export default Badge;
