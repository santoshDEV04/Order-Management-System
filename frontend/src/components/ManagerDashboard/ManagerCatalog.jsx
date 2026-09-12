import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRestaurants } from '../../api/restaurant.api.js';
import { getMenuItems } from '../../api/menu.api.js';
import { useCart } from '../../context/CartContext.jsx';
import { Store, ChevronRight, ArrowLeft, Plus, MapPin, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export const ManagerCatalog = ({ country }) => {
  const [selectedRes, setSelectedRes] = useState(null);
  const { addToCart } = useCart();
  const [addedItemIds, setAddedItemIds] = useState([]);

  const {
    data: restaurants = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  const {
    data: menuItems = [],
    isLoading: isMenuLoading,
    isError: isMenuError,
    error: menuError,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ['menuItems', selectedRes?._id],
    queryFn: () => getMenuItems(selectedRes?._id),
    enabled: !!selectedRes?._id,
  });

  const handleAddToCart = (item) => {
    addToCart(item, selectedRes);
    setAddedItemIds((prev) => [...prev, item._id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== item._id));
    }, 1200);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading jurisdiction restaurants..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Could not load restaurants"
        message={error}
        onRetry={refetch}
      />
    );
  }

  // If inspecting a restaurant's menu
  if (selectedRes) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRes(null)}
            icon={ArrowLeft}
          >
            Back to Catalog
          </Button>
          <div className="text-right">
            <h3 className="font-semibold text-sm text-[var(--text-main)]">
              {selectedRes.name}
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              {country} Jurisdiction Scope
            </span>
          </div>
        </div>

        {isMenuLoading ? (
          <LoadingSpinner message="Fetching dishes & items..." />
        ) : isMenuError ? (
          <ErrorMessage
            title="Failed to load menu"
            message={menuError}
            onRetry={refetchMenu}
          />
        ) : menuItems.length === 0 ? (
          <EmptyState
            title="No dishes on menu"
            description="This restaurant has not added any items yet."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => {
              const wasAdded = addedItemIds.includes(item._id);
              return (
                <Card key={item._id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-[var(--text-main)]">
                        {item.name}
                      </h4>
                      <span className="font-mono font-bold text-emerald-400">
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
                      size="sm"
                      variant={wasAdded ? 'secondary' : 'primary'}
                      icon={wasAdded ? Check : Plus}
                      onClick={() => handleAddToCart(item)}
                    >
                      {wasAdded ? 'Added to Cart' : 'Add to Cart'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No restaurants found"
        description={`No restaurants found under your ${country} jurisdiction scope.`}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {restaurants.map((res) => (
        <Card
          key={res._id}
          onClick={() => setSelectedRes(res)}
          className="group hover:border-[var(--border-focus)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-emerald-400 transition-colors">
                {res.name}
              </h3>
              <Badge variant="neutral">{res.country}</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)]" />
              <span>{res.address || 'Jurisdiction Location'}</span>
            </p>
          </div>
          <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>{res.menu?.length ?? 0} Items Listed</span>
            <span className="text-[var(--text-main)] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Browse Menu <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ManagerCatalog;
