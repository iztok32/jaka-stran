import * as Icons from "lucide-react"

export const IconMapper = (iconName?: string) => {
  if (!iconName) return Icons.HelpCircle;
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.HelpCircle;
};
