"use client";

import { useState, useEffect } from 'react';

interface UserRole {
  user_id: string;
  email: string;
  role: 'admin' | 'cajero';
}

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
          const data = await response.json();
          setUserRole(data);
        } else if (response.status === 401) {
          // Usuario no autenticado
          setUserRole(null);
        } else {
          setError('Error fetching user role');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return {
    userRole,
    loading,
    error,
    isAdmin: userRole?.role === 'admin',
    isCajero: userRole?.role === 'cajero',
    // Función para refrescar el rol si es necesario
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-ejecutar el fetch
    }
  };
}