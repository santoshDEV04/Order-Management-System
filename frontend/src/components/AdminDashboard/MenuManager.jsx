import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMenuItems, createMenuItem, deleteMenuItem } from '../../api/menu.api.js';
import { ArrowLeft, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export const MenuManager = ({ restaurant, onBack }) => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['menuItems', restaurant?._id],
    queryFn: () => getMenuItems(restaurant?._id),
    enabled: !!restaurant?._id,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createMenuItem(restaurant._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurant._id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setItemForm({ name: '', description: '', price: '' });
      setIsAddOpen(false);
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to add menu item.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems', restaurant._id] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) return;
    createMutation.mutate({
      name: itemForm.name,
      description: itemForm.description,
      price: parseFloat(itemForm.price),
    });
  };

  return (
    <div className="space-y-4">
      {/* Back and Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={ArrowLeft}>
            Restaurants
          </Button>
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">
              {restaurant.name} Menu
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {restaurant.country} Jurisdiction · {menuItems.length} items listed
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} icon={Plus} size="sm">
          Add Menu Item
        </Button>
      </div>

      {/* Query Lifecycle */}
      {isLoading ? (
        <LoadingSpinner message="Fetching restaurant menu items..." />
      ) : isError ? (
        <ErrorMessage
          title="Could not load menu items"
          message={error}
          onRetry={refetch}
        />
      ) : menuItems.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items yet"
          description={`No dishes have been configured for ${restaurant.name}. Click below to add the first item.`}
          actionLabel="Add Menu Item"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {menuItems.map((item) => (
            <Card key={item._id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-sm text-[var(--text-main)]">
                    {item.name}
                  </h4>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    ${item.price?.toFixed(2)}
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete "${item.name}" from menu?`)) {
                      deleteMutation.mutate(item._id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  icon={Trash2}
                  className="text-rose-400 hover:text-rose-300"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Menu Item Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add Item to ${restaurant.name}`}
        subtitle="Item will be instantly available for orders under this restaurant."
      >
        <form onSubmit={handleAddItem} className="space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-rose-950/20 border border-rose-800/40 rounded-xl text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-[var(--text-muted)] mb-1 font-medium">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Classic Margherita Pizza"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[var(--text-muted)] mb-1 font-medium">Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="12.99"
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
              className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-[var(--text-muted)] mb-1 font-medium">Description</label>
            <textarea
              rows={2}
              placeholder="Fresh tomato sauce, buffalo mozzarella, and basil..."
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full px-3 py-2 input-minimal rounded-xl text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Save Menu Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuManager;
