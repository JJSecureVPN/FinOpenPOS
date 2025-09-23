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
  Mail, 
  Calendar, 
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
  
  const UserCard = ({ user }: { user: User }) => (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
              {user.role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              ) : (
                <Shield className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {user.email}
                {currentUser && user.id === currentUser.user_id && (
                  <Badge variant="outline" className="text-xs">Tú</Badge>
                )}
              </CardTitle>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                {user.role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Administrador
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 mr-1" />
                    Cajero
                  </>
                )}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {currentUser && user.id !== currentUser.user_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Estado de verificación:</span>
          <Badge variant={user.email_confirmed_at ? "default" : "destructive"}>
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

        {/* Dates */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Creado: {formatDate(user.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Último acceso: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca'}
            </span>
          </div>
        </div>

        {/* Activity Status */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Actividad:</span>
            <Badge variant="outline" className={
              user.last_sign_in_at && 
              new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ? "text-green-600 border-green-600" 
                : "text-gray-600"
            }>
              {user.last_sign_in_at && 
               new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ? "Activo (30d)" 
                : "Inactivo"
              }
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
                  <TableHead>Creado</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No hay usuarios registrados</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
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
                            <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <>
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Cajero
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>
                            {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
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
                          <br />
                          <Badge variant="outline" className={`text-xs ${
                            user.last_sign_in_at && 
                            new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                              ? "text-green-600 border-green-600" 
                              : "text-gray-600"
                          }`}>
                            {user.last_sign_in_at && 
                             new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                              ? "Activo" 
                              : "Inactivo"
                            }
                          </Badge>
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
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </ResponsiveShow>
    </div>
  );
}