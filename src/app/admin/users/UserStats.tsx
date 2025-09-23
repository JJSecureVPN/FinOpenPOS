"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveGrid } from "@/components/responsive";
import { Users, Shield, ShieldCheck } from "lucide-react";
import type { User } from "./types";

interface UserStatsProps {
  users: User[];
}

export default function UserStats({ users }: UserStatsProps) {
  
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const cajeroUsers = users.filter(u => u.role === "cajero").length;

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
      description: "Usuarios admin",
      icon: ShieldCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Cajeros",
      value: cajeroUsers.toString(),
      description: "Usuarios cajero",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <ResponsiveGrid 
      cols={{ default: 1, sm: 3 }}
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