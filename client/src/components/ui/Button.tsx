import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'outline' | 'danger';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  onClick, 
  className = '',
  disabled = false,
  size = 'md'
}) => {
  const baseStyles = "flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200";
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 disabled:opacity-50",
    ghost: "hover:bg-zinc-800/50 text-zinc-400 hover:text-white",
    accent: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 disabled:bg-purple-600/50 disabled:cursor-not-allowed",
    outline: "border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50",
    danger: "text-red-400 hover:bg-red-900/20 hover:text-red-300"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} className={disabled && variant === 'accent' ? 'animate-spin' : ''} />}
      {children}
    </button>
  );
};

export default Button;