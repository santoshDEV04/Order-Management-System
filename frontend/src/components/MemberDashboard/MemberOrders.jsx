import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMyOrders, placeOrder, cancelOrder } from '../../api/order.api.js';
import { ShoppingBag, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { OrderStatusBadge } from '../ui/Badge';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export const MemberOrders = () => {
  const [rbacAlert, setRbacAlert] = useState(null);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', 'my-orders'],
    queryFn: getMyOrders,
  });

  // Test mutation to demonstrate backend 403 Forbidden response for MEMBER
  const attemptPlaceMutation = useMutation({
    mutationFn: (orderId) => placeOrder(orderId, { paymentMethod: 'CARD' }),
    onError: (err) => {
      setRbacAlert({
        type: 'error',
        title: 'RBAC Enforcement: Action Blocked by Express Middleware',
        message:
          err.response?.data?.message ||
          'HTTP 403 Forbidden: User role MEMBER lacks place_order permission. Only MANAGER and ADMIN can approve orders.',
      });
    },
    onSuccess: () => {
      setRbacAlert({
        type: 'success',
        title: 'Action Succeeded',
        message: 'Order paid successfully.',
      });
    },
  });

  const attemptCancelMutation = useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onError: (err) => {
      setRbacAlert({
        type: 'error',
        title: 'RBAC Enforcement: Action Blocked by Express Middleware',
        message:
          err.response?.data?.message ||
          'HTTP 403 Forbidden: User role MEMBER lacks cancel_order permission. Only MANAGER and ADMIN can cancel orders.',
      });
    },
    onSuccess: () => {
      setRbacAlert({
        type: 'success',
        title: 'Action Succeeded',
        message: 'Order cancelled successfully.',
      });
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Fetching your order history..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Could not load your orders"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders placed yet"
        description="You have not submitted any draft orders. Visit the Catalog to add items and submit a draft order."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Live RBAC Rejection Demonstration Alert */}
      {rbacAlert && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 animate-fade-in ${
            rbacAlert.type === 'error'
              ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
              : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {rbacAlert.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{rbacAlert.title}</p>
              <p className="text-[11px] opacity-90 mt-0.5">{rbacAlert.message}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Tip: Use the persona switcher in the header to switch to Manager or Admin, where these actions are authorized.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRbacAlert(null)}
            className="text-[11px] underline hover:opacity-80 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Member RBAC Info */}
      <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-muted)] flex items-center justify-between">
        <span>
          <strong className="text-[var(--text-main)]">Member Order Lifecycle:</strong> Draft orders created by Members require authorization from a Regional Manager or Admin before fulfillment.
        </span>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Order Ref</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Current Status</TableHead>
            <TableHead className="text-right">Demonstrate Permission</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {orders.map((ord) => (
            <TableRow key={ord._id}>
              <TableCell className="font-mono font-bold text-[var(--text-main)] text-[11px]">
                #{ord._id?.slice(-6)?.toUpperCase()}
              </TableCell>
              <TableCell>
                <span className="font-medium text-[var(--text-main)]">
                  {ord.restaurant?.name || 'Restaurant'}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  {ord.country || ord.restaurant?.country} · {ord.items?.length ?? 1} items
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
                      variant="outline"
                      icon={Lock}
                      isLoading={attemptPlaceMutation.isPending}
                      onClick={() => attemptPlaceMutation.mutate(ord._id)}
                      title="Demonstrates that Members cannot approve orders (returns 403 Forbidden)"
                    >
                      Attempt Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Lock}
                      isLoading={attemptCancelMutation.isPending}
                      onClick={() => attemptCancelMutation.mutate(ord._id)}
                      title="Demonstrates that Members cannot cancel orders (returns 403 Forbidden)"
                    >
                      Attempt Cancel
                    </Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[var(--text-muted)] italic font-mono">
                    {ord.status === 'PAID' ? '✓ Approved & Paid by Manager/Admin' : '✗ Cancelled by Manager/Admin'}
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

export default MemberOrders;
