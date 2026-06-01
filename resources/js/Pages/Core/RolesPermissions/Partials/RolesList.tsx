import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    roles: Role[];
    selectedRole: Role | null;
    onRoleSelect: (roleId: number) => void;
}

export default function RolesList({ roles, selectedRole, onRoleSelect }: Props) {
    const { t } = useTranslation();

    return (
        <Card className="h-fit sticky top-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('Roles')}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <div className="space-y-1">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <Button
                                key={role.id}
                                variant={selectedRole?.id === role.id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-between",
                                    selectedRole?.id === role.id && "bg-primary/10 hover:bg-primary/20"
                                )}
                                onClick={() => onRoleSelect(role.id)}
                            >
                                <span className="truncate">{role.name}</span>
                                {selectedRole?.id === role.id && (
                                    <Check className="h-4 w-4 shrink-0 ml-2" />
                                )}
                            </Button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            {t('No roles found.')}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
