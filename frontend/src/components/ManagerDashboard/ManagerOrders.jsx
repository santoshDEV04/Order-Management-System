import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, placeOrder, cancelOrder } from '../../api/order.api.js';
import { ShoppingBag, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { OrderStatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export const ManagerOrders = ({ country }) => {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrders,
  });

  const placeMutation = useMutation({
    mutationFn: (orderId) => placeOrder(orderId, { paymentMethod: 'CARD' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setFeedback({
        type: 'success',
        message: `Order #${data?._id?.slice(-6)?.toUpperCase()} approved and marked as PAID by Manager (place_order permission).`,
      });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve order.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setFeedback({
        type: 'success',
        message: `Order #${data?._id?.slice(-6)?.toUpperCase()} cancelled by Manager (cancel_order permission).`,
      });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel order.',
      });
    },
  });

  // Filter orders matching manager's jurisdiction
  const jurisdictionOrders = orders.filter((o) => {
    if (!country || country === 'GLOBAL') return true;
    const orderCountry = o.country || o.restaurant?.country;
    return orderCountry === country;
  });

  if (isLoading) {
    return <LoadingSpinner message="Fetching regional jurisdiction orders..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Could not load orders"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (jurisdictionOrders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders in jurisdiction"
        description={`There are currently no orders placed under the ${country} jurisdiction.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* RBAC Action Feedback */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[10px] underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Jurisdiction Info */}
      <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-muted)]">
        <span>
          <strong className="text-[var(--text-main)]">Manager Authorization:</strong> Authorized to approve (<code className="text-emerald-400 font-mono">place_order</code>) and cancel (<code className="text-emerald-400 font-mono">cancel_order</code>) orders placed under {country} jurisdiction.
        </span>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Order Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Manager Action</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {jurisdictionOrders.map((ord) => (
            <TableRow key={ord._id}>
              <TableCell className="font-mono font-bold text-[var(--text-main)] text-[11px]">
                #{ord._id?.slice(-6)?.toUpperCase()}
              </TableCell>
              <TableCell>
                <div className="font-medium text-[var(--text-main)]">
                  {ord.user?.name || 'Member'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono">
                  {ord.user?.email || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{ord.restaurant?.name || 'Restaurant'}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  {ord.items?.length ?? 1} items
                </span>
              </TableCell>
              <TableCell className="font-mono font-bold text-emerald-400">
                ${ord.totalAmount?.toFixed(2)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={ord.status} />
              </TableCell>
              <TableCell className="text-right">
                {ord.status === 'CREATED' ? (
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="primary"
                      icon={CheckCircle}
                      isLoading={placeMutation.isPending}
                      onClick={() => placeMutation.mutate(ord._id)}
                    >
                      Approve & Pay
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={XCircle}
                      isLoading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(ord._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[var(--text-muted)] italic">
                    Order {ord.status.toLowerCase()}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ManagerOrders;
