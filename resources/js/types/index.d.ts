import { Config, RouteParam, RouteName } from 'ziggy-js';

export interface UserConfig {
    theme?: 'light' | 'dark';
    colorTheme?: string;
    language?: string;
    [key: string]: any;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    gsm_number?: string;
    avatar?: string;
    permissions?: string[];
    config?: UserConfig;
    unread_notifications_count?: number;
}

export interface ArticleAuthor {
    id: number;
    name: string;
}

export interface ArticleMedia {
    id: number;
    url: string;
    thumb: string;
    name: string;
}

export interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    status: 'draft' | 'published' | 'archived';
    is_public: boolean;
    published_at?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    author: ArticleAuthor;
    featured_image?: string;
    featured_image_thumb?: string;
    gallery: ArticleMedia[];
}

export interface NavigationItem {
    id: number;
    parent_id?: number | null;
    type: string;
    title_key: string;
    url?: string | null;
    icon?: string | null;
    metadata?: any;
    sort_order: number;
    is_active: boolean;
    permission?: string | null;
    children?: NavigationItem[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    locale: string;
    availableLocales: string[];
    availableColorThemes: string[];
    translations: Record<string, string>;
    navigation: {
        main: NavigationItem[];
        teams: NavigationItem[];
        projects: NavigationItem[];
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
        permission_denied?: boolean;
    };
};

declare global {
    function route(): { current: (name?: string, params?: any) => boolean };
    function route(
        name: RouteName,
        params?: RouteParam | undefined,
        absolute?: boolean,
        config?: Config,
    ): string;
}
