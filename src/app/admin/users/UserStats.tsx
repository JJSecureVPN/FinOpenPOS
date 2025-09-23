"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveGrid } from "@/components/responsive";
import { Users, Shield, ShieldCheck, UserCheck, UserX, Clock } from "lucide-react";
import type { User } from "./types";

interface UserStatsProps {
  users: User[];
}

export default function UserStats({ users }: UserStatsProps) {
  
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const cajeroUsers = users.filter(u => u.role === "cajero").length;
  const verifiedUsers = users.filter(u => u.email_confirmed_at).length;
  const unverifiedUsers = users.filter(u => !u.email_confirmed_at).length;
  
  // Consider active users as those who signed in within last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeUsers = users.filter(u => 
    u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo
  ).length;
  const inactiveUsers = totalUsers - activeUsers;

  const stats = [
    {
      title: "Total Usuarios",
      value: totalUsers.toString(),
      description: "Usuarios registrados",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Administradores",
      value: adminUsers.toString(),
      description: `${cajeroUsers} cajeros`,
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Verificados",
      value: `${verifiedUsers}/${totalUsers}`,
      description: `${unverifiedUsers} sin verificar`,
      icon: UserCheck,
      color: verifiedUsers === totalUsers ? "text-green-600" : "text-orange-600",
      bgColor: verifiedUsers === totalUsers ? "bg-green-100" : "bg-orange-100"
    },
    {
      title: "Usuarios Activos",
      value: activeUsers.toString(),
      description: `${inactiveUsers} inactivos (30d)`,
      icon: Clock,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    }
  ];

  return (
    <ResponsiveGrid 
      cols={{ default: 2, md: 4 }}
      gap="md"
      className="mb-6"
    >
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 truncate">{stat.title}</p>
                <p className={`text-lg font-bold ${stat.color} truncate`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 truncate">{stat.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </ResponsiveGrid>
  );
}