import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/Components/ui/sidebar"

import { useTranslation } from "@/lib/i18n"

import { cn } from "@/lib/utils"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType | null
    logoUrl?: string | null
    plan: string
    isLogo?: boolean
  }[]
}) {
  const { isMobile } = useSidebar()
  const { t } = useTranslation();
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  const logoContent = (
    <>
      <div className={cn(
        "flex aspect-square size-8 items-center justify-center rounded-lg",
        !activeTeam.isLogo && "bg-sidebar-primary text-sidebar-primary-foreground"
      )}>
        {activeTeam.logoUrl ? (
          <img src={activeTeam.logoUrl} alt={activeTeam.name} className="size-4 object-contain" />
        ) : activeTeam.logo && (
          <activeTeam.logo className="size-4" />
        )}
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          {activeTeam.name}
        </span>
        <span className="truncate text-xs">{activeTeam.plan}</span>
      </div>
    </>
  )

  if (teams.length === 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            {logoContent}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
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
              {logoContent}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t('Teams')}
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className={cn(
                  "flex size-6 items-center justify-center rounded-sm",
                  !team.isLogo && "border"
                )}>
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="size-4 object-contain" />
                  ) : team.logo && (
                    <team.logo className="size-4 shrink-0" />
                  )}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">{t('Add team')}</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
