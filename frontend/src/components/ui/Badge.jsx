import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    neutral: 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]',
    admin: 'badge-admin',
    manager: 'badge-manager',
    member: 'badge-member',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="admin">ADMIN</Badge>;
    case 'MANAGER':
      return <Badge variant="manager">MANAGER</Badge>;
    case 'MEMBER':
      return <Badge variant="member">MEMBER</Badge>;
    default:
      return <Badge variant="neutral">{role || 'USER'}</Badge>;
  }
};

export const OrderStatusBadge = ({ status }) => {
  switch (status) {
    case 'CREATED':
      return <Badge variant="warning">AWAITING APPROVAL</Badge>;
    case 'PAID':
      return <Badge variant="success">APPROVED & PAID</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">CANCELLED</Badge>;
    default:
      return <Badge variant="neutral">{status || 'UNKNOWN'}</Badge>;
  }
};

export default Badge;
