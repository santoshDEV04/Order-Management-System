import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createManager } from '../../api/user.api.js';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export const CreateManagerModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    country: 'INDIA',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setForm({ name: '', email: '', password: '', country: 'INDIA' });
      setErrorMsg('');
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create manager account.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Regional Manager"
      subtitle="Creates a new user with MANAGER role and assigns country jurisdiction scope."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMsg && (
          <div className="p-2.5 bg-rose-950/20 border border-rose-800/40 rounded-xl text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">Full Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Captain Marvel"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">Email Address</label>
          <input
            type="email"
            required
            placeholder="manager@jurisdiction.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-[var(--text-muted)] mb-1 font-medium">
            Assigned Country Jurisdiction (ABAC Scope)
          </label>
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full px-3 py-2 input-minimal rounded-xl text-xs"
          >
            <option value="INDIA">INDIA Jurisdiction</option>
            <option value="AMERICA">AMERICA Jurisdiction</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Manager
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateManagerModal;
