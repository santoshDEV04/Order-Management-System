import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs';

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-[11px] gap-1.5',
    md: 'px-3.5 py-2 text-xs gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2',
  };

  const variantStyles = {
    primary:
      'bg-[var(--text-main)] text-[var(--text-inverse)] hover:opacity-90 shadow-sm font-semibold',
    secondary:
      'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:bg-[var(--bg-panel)] hover:border-[var(--border-focus)]',
    danger:
      'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20',
    outline:
      'border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-focus)]',
    ghost:
      'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
