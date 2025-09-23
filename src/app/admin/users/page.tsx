"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
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
    role: "all",
    status: "all",
    activity: "all"
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return users.filter((user) => {
      // Text search
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Role filter
      const matchesRole = filters.role === "all" || user.role === filters.role;
      
      // Status filter (verification)
      const matchesStatus = filters.status === "all" || 
        (filters.status === "verified" && user.email_confirmed_at) ||
        (filters.status === "unverified" && !user.email_confirmed_at);
      
      // Activity filter
      const isActive = user.last_sign_in_at && new Date(user.last_sign_in_at) > thirtyDaysAgo;
      const matchesActivity = filters.activity === "all" ||
        (filters.activity === "active" && isActive) ||
        (filters.activity === "inactive" && !isActive);
      
      return matchesSearch && matchesRole && matchesStatus && matchesActivity;
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
      role: "all",
      status: "all",
      activity: "all"
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 text-center">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
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
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <p className="text-gray-600">Administra usuarios</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        </ResponsiveShow>

        <ResponsiveShow on="tablet-desktop">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-600">Administra los usuarios del sistema</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Usuario
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
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Complete la información del nuevo usuario del sistema
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
              <DialogTitle>Editar Rol de Usuario</DialogTitle>
              <DialogDescription>
                Modifica el rol del usuario seleccionado
              </DialogDescription>
            </DialogHeader>
            {userToEdit && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 p-2 bg-gray-50 rounded border">{userToEdit.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rol</label>
                  <select
                    value={userToEdit.role}
                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value as 'admin' | 'cajero' })}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
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
                Cancelar
              </Button>
              <Button onClick={handleEditUser}>
                Actualizar Rol
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar Usuario</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer
              </DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="space-y-4">
                <p>¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.email}</strong>?</p>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">
                    ⚠️ Esta acción eliminará permanentemente al usuario y no se puede deshacer.
                  </p>
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
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Eliminar Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertModal />
      </div>
    </ResponsiveContainer>
  );
}