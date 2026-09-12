import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createRestaurant } from '../../api/restaurant.api.js';
import { getAllUsers } from '../../api/user.api.js';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export const CreateRestaurantModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    address: '',
    country: 'INDIA',
    manager: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch users to populate the manager dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: isOpen,
  });

  // Filter managers matching selected country
  const eligibleManagers = users.filter(
    (u) => u.role === 'MANAGER' && u.country === form.country
  );

  const mutation = useMutation({
    mutationFn: createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setForm({ name: '', address: '', country: 'INDIA', manager: '' });
      setErrorMsg('');
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create restaurant.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.manager) {
      setErrorMsg(`Please select a manager assigned to ${form.country}.`);
      return;
    }
    setErrorMsg('');
    mutation.mutate(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Restaurant"
      subtitle="Creates a new regional restaurant under a manager's jurisdiction (Admin only)."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-2.5 bg-rose-950/20 border border-rose-800/40 rounded-xl text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">Restaurant Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Domino's Pizza"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">Location Address</label>
          <input
            type="text"
            required
            placeholder="e.g. 124 Main Street, Sector 5"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">
            Country Jurisdiction (ABAC Filter)
          </label>
          <select
            value={form.country}
            onChange={(e) =>
              setForm({ ...form, country: e.target.value, manager: '' })
            }
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          >
            <option value="INDIA">INDIA Jurisdiction</option>
            <option value="AMERICA">AMERICA Jurisdiction</option>
          </select>
        </div>

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">
            Assigned Regional Manager
          </label>
          {eligibleManagers.length === 0 ? (
            <p className="text-[11px] text-amber-400 p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
              No managers found for {form.country}. Create a manager for {form.country} first in the Users tab.
            </p>
          ) : (
            <select
              value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
              required
              className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
            >
              <option value="">-- Select {form.country} Manager --</option>
              {eligibleManagers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            disabled={eligibleManagers.length === 0}
          >
            Create Restaurant
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateRestaurantModal;
