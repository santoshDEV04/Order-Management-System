import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="panel-minimal rounded-2xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-xs ${className}`}>
        {children}
      </table>
    </div>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-[var(--bg-panel)] text-[var(--text-muted)] font-medium border-b border-[var(--border-subtle)]">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)]">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    onClick={onClick}
    className={`hover:bg-[var(--bg-card)] transition-colors ${
      onClick ? 'cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`py-3 px-4 font-semibold ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`py-3 px-4 ${className}`}>{children}</td>
);

export default Table;
