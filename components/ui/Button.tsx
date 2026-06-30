import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "white" | "text";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold uppercase tracking-wider rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-terracotta-rose hover:bg-terracotta-hover text-white shadow-sm hover:-translate-y-0.5",
    secondary: "bg-deep-teal hover:bg-teal-dark text-white shadow-sm hover:-translate-y-0.5",
    outline: "border border-text-dark/40 text-text-dark hover:bg-deep-teal hover:border-deep-teal hover:text-white",
    white: "bg-white text-text-dark hover:bg-cream-dark shadow-sm hover:-translate-y-0.5",
    text: "text-text-muted hover:text-text-dark underline normal-case tracking-normal px-0 py-0"
  };

  const sizes = {
    sm: "text-xs px-5 py-2.5",
    md: "text-sm px-8 py-3.5",
    lg: "text-base px-10 py-4"
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
