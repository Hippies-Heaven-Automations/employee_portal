import { cn } from "../utils";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-purple-700 text-white hover:bg-purple-800 focus:ring-purple-500",
    outline:
      "border border-purple-700 text-purple-700 hover:bg-purple-50 focus:ring-purple-500",
    ghost:
      "text-purple-700 hover:bg-purple-50 focus:ring-purple-400",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], "px-6 py-2", className)}
      {...props}
    >
      {children}
    </button>
  );
}
