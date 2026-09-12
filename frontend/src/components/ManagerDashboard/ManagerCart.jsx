import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, placeOrder } from '../../api/order.api.js';
import { useCart } from '../../context/CartContext.jsx';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

export const ManagerCart = ({ country, onOrderSuccess }) => {
  const queryClient = useQueryClient();
  const { cart, selectedRestaurant, updateQuantity, removeFromCart, clearCart, calculateSubtotal } = useCart();

  // Regional Tax calculation (ABAC demonstration)
  const subtotal = calculateSubtotal();
  const taxRate = country === 'INDIA' ? 0.18 : 0.08;
  const taxName = country === 'INDIA' ? '18% GST' : '8% Sales Tax';
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount;

  const checkoutMutation = useMutation({
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
      // 1. Create order
      const newOrder = await createOrder(orderPayload);
      // 2. Manager has place_order permission, so execute immediate placement
      if (newOrder?._id) {
        await placeOrder(newOrder._id, { paymentMethod: 'CARD' });
      }
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      if (onOrderSuccess) onOrderSuccess();
    },
  });

  if (cart.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Select dishes from the catalog to assemble an authorized order."
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-[var(--text-main)]">
            Active Cart ({selectedRestaurant?.name || 'Selected Restaurant'})
          </h3>
          <p className="text-[11px] text-[var(--text-muted)]">
            Authorized regional purchasing under {country} jurisdiction
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} icon={Trash2}>
          Clear Cart
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

      {/* Financial Tax Calculation */}
      <Card className="space-y-2 text-xs">
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>Subtotal</span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>Regional Tax ({taxName})</span>
          <span className="font-mono">${taxAmount.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between font-bold text-sm text-[var(--text-main)]">
          <span>Total</span>
          <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
        </div>
      </Card>

      <Button
        className="w-full py-3"
        size="lg"
        isLoading={checkoutMutation.isPending}
        onClick={() => checkoutMutation.mutate()}
        icon={ArrowRight}
      >
        Place & Authorize Order (${grandTotal.toFixed(2)})
      </Button>
    </div>
  );
};

export default ManagerCart;
