import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, placeOrder, cancelOrder, updatePaymentMethod } from '../../api/order.api.js';
import { ShoppingBag, CreditCard, CheckCircle, XCircle, Check, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { OrderStatusBadge, Badge } from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export const OrderList = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newMethod, setNewMethod] = useState('CARD');
  const [actionFeedback, setActionFeedback] = useState(null);

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
      setActionFeedback({
        type: 'success',
        message: `Order #${data?._id?.slice(-6)?.toUpperCase()} approved and marked as PAID by Admin (place_order permission).`,
      });
      setTimeout(() => setActionFeedback(null), 4000);
    },
    onError: (err) => {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve order.',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActionFeedback({
        type: 'success',
        message: `Order #${data?._id?.slice(-6)?.toUpperCase()} cancelled by Admin (cancel_order permission).`,
      });
      setTimeout(() => setActionFeedback(null), 4000);
    },
    onError: (err) => {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel order.',
      });
    },
  });

  const paymentMutation = useMutation({
    mutationFn: ({ orderId, method }) => updatePaymentMethod(orderId, method),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
      setActionFeedback({
        type: 'success',
        message: `Payment method updated to ${newMethod} for Order #${data?._id?.slice(-6)?.toUpperCase()} (update_payment admin permission).`,
      });
      setTimeout(() => setActionFeedback(null), 4000);
    },
    onError: (err) => {
      setActionFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update payment method.',
      });
    },
  });

  const handleOpenPayment = (ord) => {
    setSelectedOrder(ord);
    setNewMethod(ord.paymentMethod || 'CARD');
  };

  const handleSavePayment = () => {
    if (!selectedOrder) return;
    paymentMutation.mutate({ orderId: selectedOrder._id, method: newMethod });
  };

  if (isLoading) {
    return <LoadingSpinner message="Fetching system orders..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Could not load system orders"
        message={error}
        onRetry={refetch}
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders in system"
        description="No orders have been submitted yet. Log in as a Member to submit a draft order."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* RBAC Action Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-[10px] underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Privilege Explanation */}
      <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs flex items-center justify-between text-[var(--text-muted)]">
        <span>
          <strong className="text-[var(--text-main)]">Superuser Governance:</strong> Admin holds all permissions — <code className="text-emerald-400 font-mono">place_order</code>, <code className="text-emerald-400 font-mono">cancel_order</code>, and <code className="text-emerald-400 font-mono">update_payment</code> across all regions.
        </span>
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Order Ref</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Admin Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {orders.map((ord) => (
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
                  {ord.country || ord.restaurant?.country}
                </span>
              </TableCell>
              <TableCell className="font-mono font-bold text-emerald-400">
                ${ord.totalAmount?.toFixed(2)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={ord.status} />
              </TableCell>
              <TableCell>
                <Badge variant="neutral">{ord.paymentMethod || 'CARD'}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {ord.status === 'CREATED' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle}
                        isLoading={placeMutation.isPending}
                        onClick={() => placeMutation.mutate(ord._id)}
                        title="Approve and mark order as PAID"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        isLoading={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(ord._id)}
                        title="Cancel this order"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPayment(ord)}
                    icon={CreditCard}
                    title="Change payment method (Admin only)"
                  >
                    Edit Payment
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Payment Method Override Modal (Admin Privilege) */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Admin Payment Override"
        subtitle={`Update payment instrument for Order #${selectedOrder?._id?.slice(-6)?.toUpperCase()} (Admin only)`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[var(--text-muted)] mb-1 font-medium">Select Payment Method</label>
            <select
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
            >
              <option value="CARD">Credit / Debit Card</option>
              <option value="UPI">Instant UPI Transfer</option>
              <option value="CASH">Cash on Delivery</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setSelectedOrder(null)}
              disabled={paymentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePayment}
              isLoading={paymentMutation.isPending}
              icon={Check}
            >
              Update Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderList;
