import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  options: SelectOption[];
  placeholderOption: string;
}

export const Select: React.FC<SelectProps> = ({
  id,
  options,
  placeholderOption,
  className = "",
  value,
  required,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        required={required}
        className={`w-full bg-transparent border-b border-text-dark/20 py-3 focus:outline-none focus:border-deep-teal text-[16px] text-text-dark/80 transition-colors appearance-none cursor-pointer ${className}`}
        {...props}
      >
        <option value="" disabled className="text-text-muted">
          {placeholderOption}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-4 pointer-events-none text-text-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
};
