import React, { createContext, useContext, useState } from "react";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = "",
  ...props
}) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : localValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setLocalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-cream-dark/50 p-1 text-text-muted ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = "", ...props }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold tracking-wide transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-white text-deep-teal shadow-xs font-bold"
          : "hover:bg-white/40 text-text-muted hover:text-text-dark"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = "", ...props }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const isActive = context.value === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-4 focus-visible:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
