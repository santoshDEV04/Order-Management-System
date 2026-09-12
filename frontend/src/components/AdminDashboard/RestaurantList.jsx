import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRestaurants, deleteRestaurant } from '../../api/restaurant.api.js';
import { Store, ChevronRight, MapPin, User, Plus, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';
import CreateRestaurantModal from './CreateRestaurantModal';

export const RestaurantList = ({ onSelectRestaurant }) => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: restaurants = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
  });

  const handleDelete = (e, res) => {
    e.stopPropagation();
    if (window.confirm(`Delete restaurant "${res.name}"?`)) {
      deleteMutation.mutate(res._id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading restaurants catalog..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to load restaurants"
        message={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-muted)]">
          {restaurants.length} active restaurants across all jurisdictions
        </p>
        <Button onClick={() => setIsCreateOpen(true)} icon={Plus} size="sm">
          Add Restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No restaurants available"
          description="There are currently no restaurants in the database. Click below to add the first restaurant."
          actionLabel="Add Restaurant"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {restaurants.map((res) => (
            <Card
              key={res._id}
              onClick={() => onSelectRestaurant(res)}
              className="group hover:border-[var(--border-focus)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-emerald-400 transition-colors">
                    {res.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="neutral">{res.country}</Badge>
                    <button
                      onClick={(e) => handleDelete(e, res)}
                      disabled={deleteMutation.isPending}
                      className="text-zinc-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                      title="Delete Restaurant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
                  <span>{res.address || 'Standard Location'}</span>
                </p>

                {res.manager && (
                  <div className="p-2 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] flex items-center gap-2 mb-3">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Manager: <strong className="text-[var(--text-main)]">{res.manager.name}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>{res.menu?.length ?? 0} Menu Items</span>
                <span className="text-[var(--text-main)] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Manage Menu <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateRestaurantModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};

export default RestaurantList;
