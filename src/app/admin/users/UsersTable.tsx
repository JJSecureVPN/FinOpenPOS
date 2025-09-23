"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveShow } from "@/components/responsive";
import { 
  Shield, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { User, CurrentUser } from "./types";

interface UsersTableProps {
  users: User[];
  currentUser: CurrentUser | null;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({ users, currentUser, onEdit, onDelete }: UsersTableProps) {
  
  const UserCard = ({ user }: { user: User }) => {
    const isActive = user.last_sign_in_at && 
      new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Shield className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {user.role === 'admin' ? 'Admin' : 'Cajero'}
                    </Badge>
                    {currentUser && user.id === currentUser.user_id && (
                      <Badge variant="outline" className="text-xs">Tú</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  {user.email_confirmed_at ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Verificado
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      Sin verificar
                    </>
                  )}
                </span>
                <span className={`flex items-center gap-1 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  <Clock className="w-3 h-3" />
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              {currentUser && user.id !== currentUser.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(user)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {/* Mobile: Cards View */}
      <ResponsiveShow on="mobile">
        <div className="space-y-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay usuarios registrados</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      </ResponsiveShow>

      {/* Desktop: Table View */}
      <ResponsiveShow on="tablet-desktop">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuarios del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No hay usuarios registrados</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const isActive = user.last_sign_in_at && 
                      new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                              {user.role === 'admin' ? (
                                <ShieldCheck className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Shield className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.email}
                                {currentUser && user.id === currentUser.user_id && (
                                  <Badge variant="outline" className="text-xs">Tú</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Admin' : 'Cajero'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.email_confirmed_at ? "default" : "destructive"} className="text-xs">
                              {user.email_confirmed_at ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verificado
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Sin verificar
                                </>
                              )}
                            </Badge>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 text-sm ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              <Clock className="w-3 h-3" />
                              <span>
                                {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca'}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            {currentUser && user.id !== currentUser.user_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(user)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ResponsiveShow>
    </div>
  );
}