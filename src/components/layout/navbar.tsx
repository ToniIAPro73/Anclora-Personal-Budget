'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSelector } from '@/components/ui/language-selector'
import { Button } from '@/components/ui/button'
// import { Bell, Search, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from './sidebar' // Re-using sidebar for mobile menu if needed
import { signOut } from "next-auth/react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Mobile Menu Trigger & Brand */}
        <div className="flex items-center gap-4">
            <div className="md:hidden">
                 {/* Simple mobile menu trigger placeholder */}
                {/* <Menu className="h-5 w-5" /> */}
                <span className="text-xl">☰</span>
            </div>
            
            <Link href="/" className="flex items-center gap-2">
                {/* Branding - visible on mobile or when sidebar is hidden/collapsed contextually, 
                    but we'll show it here to ensure "App Name" requirement is met everywhere. */}
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
            {/* <Search className="h-5 w-5" /> */}
            <span>🔍</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            {/* <Bell className="h-5 w-5" /> */}
            <span>🔔</span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border border-background"></span>
          </Button>

          <ThemeToggle />
          
          <LanguageSelector />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary/10 border border-primary/20">
                  <span className="font-medium text-sm text-primary">U</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer" 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  Cerrar Sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
