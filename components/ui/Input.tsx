import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  type = "text",
  className = "",
  placeholder,
  required,
  ...props
}) => {
  return (
    <div className="relative w-full group">
      <input
        type={type}
        id={id}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] transition-colors placeholder:text-text-muted/60 ${className}`}
        {...props}
      />
    </div>
  );
};
