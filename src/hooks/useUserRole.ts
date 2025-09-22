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

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return {
    userRole,
    loading,
    isAdmin: userRole?.role === 'admin',
    isCajero: userRole?.role === 'cajero'
  };
}