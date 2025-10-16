import { cn } from "../utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
}

export function Button({ variant = "default", className, ...props }: ButtonProps) {
  const base = "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200";

  const styles =
    variant === "ghost"
      ? "bg-transparent border border-purple-600 text-purple-700 hover:bg-purple-100"
      : "bg-purple-700 text-white hover:bg-purple-800";

  return <button className={cn(base, styles, className)} {...props} />;
}
