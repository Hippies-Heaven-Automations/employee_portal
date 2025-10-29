import { cn } from "../utils";
import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
}

export function Button({
  variant = "primary",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-md transition focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-hemp-green text-white hover:bg-hemp-forest focus:ring-2 focus:ring-hemp-sage focus:ring-offset-2",
    outline:
      "border border-hemp-green text-hemp-forest hover:bg-hemp-mist focus:ring-2 focus:ring-hemp-green focus:ring-offset-2",
    ghost:
      "text-hemp-forest hover:bg-hemp-mist focus:ring-2 focus:ring-hemp-sage focus:ring-offset-2",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(base, variants[variant], className)}
    />
  );
}
