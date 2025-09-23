"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
import { Typography } from "@/components/ui/typography";
import { UserPlus, Users, AlertTriangle, Loader2Icon } from "lucide-react";
import { useAlert } from "@/components/ui/alert-modal";

// Import our new modular components
import UserStats from "./UserStats";
import UserSearchFilters from "./UserSearchFilters";
import UsersTable from "./UsersTable";
import UserForm from "./UserForm";
import type { User, NewUser, CurrentUser, UserFilters } from "./types";

export default function UsersManagement() {
  // Main data state
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<UserFilters>({
    role: "all"
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Selected user states
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { showAlert, AlertModal } = useAlert();

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.status === 403) {
        setError('Acceso denegado. Solo los administradores pueden ver esta página.');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Text search
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role filter
      const matchesRole = filters.role === "all" || user.role === filters.role;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filters]);

  // User CRUD operations
  const handleCreateUser = async (userData: NewUser) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          role: userData.role
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers(prev => [...prev, createdUser]);
        setShowCreateDialog(false);
        showAlert('Usuario creado exitosamente', { variant: 'success' });
      } else {
        const error = await response.json();
        showAlert('Error al crear usuario: ' + error.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showAlert('Error al crear usuario', { variant: 'error' });
    }
  };

  const handleEditUser = async () => {
    if (!userToEdit) return;

    try {
      const response = await fetch(`/api/admin/users/${userToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: userToEdit.role }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => 
          prev.map(u => u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u)
        );
        setShowEditDialog(false);
        setUserToEdit(null);
        showAlert('Rol actualizado exitosamente', { variant: 'success' });
      } else {
        const error = await response.json();
        showAlert('Error al actualizar rol: ' + error.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showAlert('Error al actualizar rol', { variant: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        setShowDeleteDialog(false);
        setUserToDelete(null);
        showAlert('Usuario eliminado exitosamente', { variant: 'success' });
      } else {
        const error = await response.json();
        showAlert('Error al eliminar usuario: ' + error.error, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('Error al eliminar usuario', { variant: 'error' });
    }
  };

  // Event handlers
  const onEditUser = (user: User) => {
    setUserToEdit(user);
    setShowEditDialog(true);
  };

  const onDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const onClearFilters = () => {
    setSearchTerm("");
    setFilters({
      role: "all"
    });
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      </ResponsiveContainer>
    );
  }

  // Access denied for non-admin users
  if (error?.includes('Acceso denegado') || (!loading && currentUser?.role !== 'admin')) {
    return (
      <ResponsiveContainer>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <Typography variant="h2" weight="semibold" className="text-gray-900 mb-2">Acceso Denegado</Typography>
            <Typography variant="body" className="text-gray-600 text-center">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </Typography>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <Typography variant="h2" weight="semibold" className="text-gray-900 mb-2">Error</Typography>
            <Typography variant="body" className="text-red-600 text-center mb-4">{error}</Typography>
            <Button onClick={() => window.location.reload()}>
              <Typography variant="button">Reintentar</Typography>
            </Button>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <ResponsiveShow on="mobile">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <Typography variant="h1" weight="bold">Gestión de Usuarios</Typography>
                <Typography variant="body" className="text-gray-600">Administra usuarios</Typography>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              <Typography variant="button">Crear Usuario</Typography>
            </Button>
          </div>
        </ResponsiveShow>

        <ResponsiveShow on="tablet-desktop">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <Typography variant="h1" weight="bold" className="text-gray-900">Gestión de Usuarios</Typography>
                <Typography variant="body" className="text-gray-600">Administra los usuarios del sistema</Typography>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              <Typography variant="button">Crear Usuario</Typography>
            </Button>
          </div>
        </ResponsiveShow>

        {/* Statistics */}
        <UserStats users={users} />

        {/* Search and Filters */}
        <UserSearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={onClearFilters}
          totalCount={users.length}
          filteredCount={filteredUsers.length}
        />

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          currentUser={currentUser}
          onEdit={onEditUser}
          onDelete={onDeleteUser}
        />

        {/* Create User Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                <Typography variant="h3" weight="semibold">Crear Nuevo Usuario</Typography>
              </DialogTitle>
              <DialogDescription>
                <Typography variant="body-sm" className="text-gray-600">
                  Complete la información del nuevo usuario del sistema
                </Typography>
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateDialog(false)}
              submitText="Crear Usuario"
            />
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Typography variant="h3" weight="semibold">Editar Rol de Usuario</Typography>
              </DialogTitle>
              <DialogDescription>
                <Typography variant="body-sm" className="text-gray-600">
                  Modifica el rol del usuario seleccionado
                </Typography>
              </DialogDescription>
            </DialogHeader>
            {userToEdit && (
              <div className="space-y-4">
                <div>
                  <Typography variant="body-sm" weight="medium" className="text-gray-700" as="label">Email</Typography>
                  <Typography variant="body" className="mt-1 p-2 bg-gray-50 rounded border block">{userToEdit.email}</Typography>
                </div>
                <div>
                  <Typography variant="body-sm" weight="medium" className="text-gray-700" as="label">Rol</Typography>
                  <select
                    value={userToEdit.role}
                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as 'admin' | 'cajero' })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-sm"
                  >
                    <option value="cajero">Cajero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setUserToEdit(null);
                }}
              >
                <Typography variant="button">Cancelar</Typography>
              </Button>
              <Button onClick={handleEditUser}>
                <Typography variant="button">Actualizar Rol</Typography>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Typography variant="h3" weight="semibold">Eliminar Usuario</Typography>
              </DialogTitle>
              <DialogDescription>
                <Typography variant="body-sm" className="text-gray-600">
                  Esta acción no se puede deshacer
                </Typography>
              </DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="space-y-4">
                <Typography variant="body">
                  ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.email}</strong>?
                </Typography>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <Typography variant="body-sm" className="text-red-600">
                    ⚠️ Esta acción eliminará permanentemente al usuario y no se puede deshacer.
                  </Typography>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setUserToDelete(null);
                }}
              >
                <Typography variant="button">Cancelar</Typography>
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                <Typography variant="button">Eliminar Usuario</Typography>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertModal />
      </div>
    </ResponsiveContainer>
  );
}