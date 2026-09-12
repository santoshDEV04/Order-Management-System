import React from 'react';

export const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`panel-card rounded-2xl p-4 sm:p-5 transition-all ${
        onClick ? 'cursor-pointer hover:border-[var(--border-focus)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between gap-3 mb-3 ${className}`}>
      <div>
        {title && (
          <h3 className="text-sm font-semibold text-[var(--text-main)] tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default Card;
