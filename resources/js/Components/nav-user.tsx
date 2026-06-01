"use client"

import * as React from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react"
import { Link, router } from "@inertiajs/react"
import { useTranslation } from "@/lib/i18n"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/Components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/Components/ui/sidebar"
import { IconMapper } from "@/lib/icon-mapper"

export function NavUser({
  user,
  items = [],
  unreadCount = 0,
}: {
  user: {
    name: string
    email: string
    avatar?: string
  },
  items?: {
    title: string
    url: string
    icon?: any
  }[],
  unreadCount?: number,
}) {
  const { isMobile } = useSidebar()
  const { t } = useTranslation()

  const handleLogout = () => {
    router.post(route('logout'))
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <Link
                href={route('notifications.inbox')}
                className="flex items-center gap-2 px-1 py-1.5 text-left text-sm w-full rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                {unreadCount > 0 && (
                  <Bell className="ml-auto h-4 w-4 text-destructive shrink-0" />
                )}
              </Link>
            </DropdownMenuLabel>
            
            {items.length > 0 && <DropdownMenuSeparator />}
            
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={item.url} className="flex w-full items-center">
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {t(item.title)}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </React.Fragment>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {t('Log Out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
