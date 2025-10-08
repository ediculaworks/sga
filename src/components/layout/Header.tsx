'use client';

import { useAuth } from '@/hooks/useAuth';
import { getProfileLabel } from '@/config/navigation';
import { Bell, Settings, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/**
 * Componente Header
 *
 * Cabeçalho do sistema com informações do usuário, notificações e menu dropdown.
 * Responsivo e adaptado para cada perfil.
 */

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Pegar iniciais do nome para avatar
  const getInitials = (name: string): string => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
      {/* Left side - Title or breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Espaço para o botão mobile (já está na Sidebar) */}
        <div className="lg:hidden w-10"></div>

        <div>
          <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
            {getProfileLabel(user.tipo_perfil)}
          </h1>
          <p className="text-sm text-gray-500 hidden md:block">
            Bem-vindo, {user.nome_completo.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Right side - Notifications and User Menu */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {/* Badge de notificações (hardcoded por enquanto) */}
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            3
          </Badge>
        </Button>

        {/* User Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm">
                  {getInitials(user.nome_completo)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user.nome_completo.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-xs text-gray-500">{getProfileLabel(user.tipo_perfil)}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
