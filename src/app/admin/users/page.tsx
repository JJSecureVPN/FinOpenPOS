"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/ui/alert-modal";
import { 
  UserPlus, 
  Users, 
  Shield, 
  ShieldCheck, 
  Trash2, 
  Edit,
  AlertTriangle 
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'cajero';
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface NewUser {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'cajero';
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<{user_id: string; email: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cajero'
  });
  const { showAlert, AlertModal } = useAlert();

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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.status === 403) {
        // Usuario no es admin
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (newUser.password !== newUser.confirmPassword) {
      showAlert('Las contraseñas no coinciden', { variant: 'error' });
      return;
    }

    if (newUser.password.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres', { variant: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          role: newUser.role
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
        setIsCreateDialogOpen(false);
        setNewUser({ email: '', password: '', confirmPassword: '', role: 'cajero' });
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

  const handleUpdateUserRole = async () => {
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
        setUsers(users.map(u => u.id === updatedUser.id ? { ...u, role: updatedUser.role } : u));
        setIsEditDialogOpen(false);
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
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setIsDeleteDialogOpen(false);
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

  // Si el usuario no es admin, mostrar mensaje de acceso denegado
  if (!loading && currentUser?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600 text-center">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex justify-center py-12">
            <p>Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600">Administra los usuarios del sistema</p>
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Cajero
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    placeholder="Repite la contraseña"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value: 'admin' | 'cajero') => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cajero">Cajero</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser}>
                  Crear Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Último acceso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <><ShieldCheck className="h-3 w-3 mr-1" />Admin</>
                      ) : (
                        <><Shield className="h-3 w-3 mr-1" />Cajero</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.email_confirmed_at ? 'default' : 'destructive'}>
                      {user.email_confirmed_at ? 'Verificado' : 'Sin verificar'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUserToEdit(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      {currentUser && user.id !== currentUser.user_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
          </DialogHeader>
          {userToEdit && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={userToEdit.email} disabled />
              </div>
              <div>
                <Label htmlFor="editRole">Rol</Label>
                <Select 
                  value={userToEdit.role} 
                  onValueChange={(value: 'admin' | 'cajero') => setUserToEdit({ ...userToEdit, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cajero">Cajero</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUserRole}>
              Actualizar Rol
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
          </DialogHeader>
          {userToDelete && (
            <div className="space-y-4">
              <p>¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.email}</strong>?</p>
              <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
  );
}