import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../api/order.api.js';
import { useCart } from '../../context/CartContext.jsx';
import { ShoppingCart, Trash2, Plus, Minus, Lock, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

export const MemberCart = ({ country, onOrderSubmitted }) => {
  const queryClient = useQueryClient();
  const { cart, selectedRestaurant, updateQuantity, removeFromCart, clearCart, calculateSubtotal } = useCart();
  const [feedback, setFeedback] = useState(null);

  const subtotal = calculateSubtotal();
  const taxRate = country === 'INDIA' ? 0.18 : 0.08;
  const taxName = country === 'INDIA' ? '18% GST' : '8% Sales Tax';
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  // Member calls createOrder to persist draft order to the backend database!
  const draftMutation = useMutation({
    mutationFn: async () => {
      const orderPayload = {
        restaurantId: selectedRestaurant._id,
        items: cart.map((i) => ({
          menuItemId: i._id,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: grandTotal,
        paymentMethod: 'CARD',
        country: country || 'INDIA',
      };
      return await createOrder(orderPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      setFeedback({
        type: 'success',
        message: `Draft Order #${data?._id?.slice(-6)?.toUpperCase()} submitted successfully! It is now visible to your Regional Manager and Admin for approval.`,
      });
      if (onOrderSubmitted) {
        setTimeout(() => onOrderSubmitted(), 1500);
      }
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit draft order.',
      });
    },
  });

  if (cart.length === 0 && !feedback) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Draft cart is empty"
        description="Browse the catalog to add items to your draft order."
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">{feedback.message}</p>
        </div>
      )}

      {cart.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-[var(--text-main)]">
                Draft Cart ({selectedRestaurant?.name || 'Selected Restaurant'})
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Items assembled for review under {country} jurisdiction
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart} icon={Trash2}>
              Clear
            </Button>
          </div>

          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 panel-card rounded-xl text-xs"
              >
                <div>
                  <p className="font-semibold text-[var(--text-main)]">{item.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    ${item.price?.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-panel)] overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-mono font-bold text-[var(--text-main)] min-w-16 text-right">
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tax Breakdown */}
          <Card className="space-y-2 text-xs">
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Estimated Tax ({taxName})</span>
              <span className="font-mono">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between font-bold text-sm text-[var(--text-main)]">
              <span>Total Draft Amount</span>
              <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
          </Card>

          {/* RBAC Educational Callout */}
          <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[var(--text-main)] font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>RBAC Enforcement Model</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Members have permission to create draft orders (<code className="text-[var(--text-main)] font-mono">create_order</code>). Submitting saves this order to the database so your Regional Manager and Admin can see and authorize it. Direct payment checkout (<code className="text-[var(--text-main)] font-mono">place_order</code>) is restricted to Managers and Admins.
            </p>
          </div>

          <Button
            className="w-full py-3"
            size="lg"
            isLoading={draftMutation.isPending}
            onClick={() => draftMutation.mutate()}
            icon={Send}
          >
            Submit Draft Order to Manager (${grandTotal.toFixed(2)})
          </Button>
        </>
      )}
    </div>
  );
};

export default MemberCart;
