import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, deleteUser } from '../../api/user.api.js';
import { Search, UserPlus, Trash2, Shield } from 'lucide-react';
import Button from '../ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { RoleBadge, Badge } from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';
import CreateManagerModal from './CreateManagerModal';

export const UserList = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const handleDelete = (userId, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      deleteMutation.mutate(userId);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-3 py-2 input-minimal rounded-xl text-xs"
          />
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          icon={UserPlus}
          size="sm"
        >
          Create Regional Manager
        </Button>
      </div>

      {/* Query Lifecycle States */}
      {isLoading ? (
        <LoadingSpinner message="Fetching user directory..." />
      ) : isError ? (
        <ErrorMessage
          title="Could not load users"
          message={error}
          onRetry={refetch}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No users found"
          description={
            search
              ? `No users match "${search}". Try searching for another name or email.`
              : 'There are currently no registered users in the database.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Country Scope</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u._id}>
                <TableCell className="font-semibold text-[var(--text-main)] flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center font-bold text-[10px]">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span>{u.name}</span>
                </TableCell>
                <TableCell className="font-mono text-[var(--text-muted)] text-[11px]">
                  {u.email}
                </TableCell>
                <TableCell>
                  <RoleBadge role={u.role} />
                </TableCell>
                <TableCell>
                  <Badge variant="neutral">{u.country || 'GLOBAL'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(u._id, u.name)}
                    disabled={deleteMutation.isPending}
                    icon={Trash2}
                    title="Delete User"
                    className="text-rose-400 hover:text-rose-300"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default UserList;
