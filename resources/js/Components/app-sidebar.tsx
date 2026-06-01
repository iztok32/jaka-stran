import * as React from "react"
import * as Icons from "lucide-react"
import { NavMain } from "@/Components/nav-main"
import { NavUser } from "@/Components/nav-user"
import { TeamSwitcher } from "@/Components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/Components/ui/sidebar"
import { NavigationItem, User } from "@/types"
import { usePage } from "@inertiajs/react"
import { PageProps } from "@/types"
import { useTranslation } from "@/lib/i18n"

import { IconMapper } from "@/lib/icon-mapper"

export function AppSidebar({ 
    user, 
    navigation, 
    ...props 
}: React.ComponentProps<typeof Sidebar> & { 
    user: User, 
    navigation: { 
        blocks: {
            type: string,
            group: string,
            label: string,
            items: NavigationItem[]
        }[],
        configs: Record<string, string>
    } 
}) {
  const { t } = useTranslation();
  const { auth } = usePage<PageProps>().props;
  const unreadCount = auth.user?.unread_notifications_count ?? 0;

  const mapItems = (items: NavigationItem[]) => items.map(item => ({
    title: t(item.title_key || ''),
    url: item.url || '#',
    icon: IconMapper(item.icon || undefined),
    isActive: false,
    items: item.children?.map(sub => ({
      title: t(sub.title_key || ''),
      url: sub.url || '#',
      icon: IconMapper(sub.icon || undefined),
    })) || [],
  }));

  const mainBlocks = navigation.blocks.filter(b => b.group === 'main');
  const headerBlocks = navigation.blocks.filter(b => b.group === 'header');
  const settingsBlocks = navigation.blocks.filter(b => b.group === 'settings');
  const userBlocks = navigation.blocks.filter(b => b.group === 'users');

  const teams = headerBlocks.flatMap(block => block.items).map(team => {
    const isUrl = team.icon?.includes('/') || team.icon?.includes('.');
    return {
      name: t(team.title_key || ''),
      logo: isUrl ? null : IconMapper(team.icon || undefined),
      logoUrl: isUrl ? team.icon : (team.metadata?.logo_url || null),
      plan: team.metadata?.plan || '',
      isLogo: team.metadata?.is_logo || isUrl || false,
    };
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {mainBlocks.map(block => (
          <NavMain
            key={block.type}
            items={mapItems(block.items)}
            label={navigation.configs[block.type] || t(block.label)}
          />
        ))}
        {settingsBlocks.map(block => (
          <NavMain
            key={block.type}
            items={mapItems(block.items)}
            label={navigation.configs[block.type] || t(block.label)}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatar ? `/storage/${user.avatar}` : undefined
          }}
          items={userBlocks.flatMap(b => mapItems(b.items)).map(i => ({ title: i.title, url: i.url, icon: i.icon }))}
          unreadCount={unreadCount}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
