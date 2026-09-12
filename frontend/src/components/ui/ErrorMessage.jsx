import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorMessage = ({
  title = 'Failed to load data',
  message,
  onRetry,
  className = '',
}) => {
  const displayMessage =
    typeof message === 'string'
      ? message
      : message?.response?.data?.message ||
        message?.message ||
        'An unexpected error occurred while communicating with the server.';

  return (
    <div
      className={`p-4 bg-rose-950/20 border border-rose-800/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-300">{title}</p>
          <p className="text-[11px] text-rose-400/90 mt-0.5">{displayMessage}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="danger"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          className="shrink-0"
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
