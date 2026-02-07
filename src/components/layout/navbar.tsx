'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSelector } from '@/components/ui/language-selector'
import { Button } from '@/components/ui/button'
import { Bell, Search, Menu, User, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { signOut } from "next-auth/react"
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function Navbar() {
  const queryClient = useQueryClient();
  
  const { data: alertsData } = useQuery({
    queryKey: ["alerts-unread"],
    queryFn: () => fetch("/api/alerts?unread=true").then(res => res.json()),
    refetchInterval: 30000, // Refetch every 30s
  });

  const { data: recentAlerts } = useQuery({
    queryKey: ["alerts-recent"],
    queryFn: () => fetch("/api/alerts").then(res => res.json()),
    enabled: !!alertsData,
  });

  const markAllRead = useMutation({
    mutationFn: () => fetch("/api/alerts", { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts-unread"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-recent"] });
    },
  });

  const unreadCount = alertsData?.count || 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Mobile Menu Trigger & Brand */}
        <div className="flex items-center gap-4">
            <div className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
            </div>
            
            <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="font-bold text-primary text-xl">A</span>
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
                    Anclora <span className="font-normal text-muted-foreground">Personal Budget</span>
                </span>
            </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>

          <DropdownMenu onOpenChange={(open) => open && unreadCount > 0 && markAllRead.mutate()}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="text-xs font-semibold">Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {recentAlerts?.length > 0 ? (
                  recentAlerts.map((alert: any) => (
                    <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3 gap-1 cursor-default">
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[10px] font-bold uppercase ${
                          alert.priority === 'critical' ? 'text-red-500' : 
                          alert.priority === 'high' ? 'text-amber-500' : 'text-primary'
                        }`}>
                          {alert.title}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-xs leading-tight">{alert.message}</p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No tienes notificaciones pendientes
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
          
          <LanguageSelector />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary/10 border border-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer flex items-center gap-2" 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut className="h-4 w-4" /> Cerrar Sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
