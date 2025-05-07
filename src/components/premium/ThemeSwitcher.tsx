
'use client';

import type { FC } from 'react';
import { useTheme } from '@/components/providers/ThemeProvider'; // Import useTheme hook
import { Button } from '@/components/ui/button';
import { Moon, Sun, Droplet, Gift, Ghost, Snowflake, Palette } from 'lucide-react'; // Import Snowflake icon & Palette
import { cn } from '@/lib/utils';
import type { Theme } from '@/components/providers/ThemeProvider'; // Import Theme type

interface ThemeSwitcherProps {
  availableThemes: Theme[];
}

// Map theme names to icons and display names
const themeConfig: Record<Theme, { icon: React.ElementType; label: string; iconColor?: string }> = {
  light: { icon: Sun, label: 'Light', iconColor: 'text-yellow-400' },
  dark: { icon: Moon, label: 'Dark', iconColor: 'text-primary' },
  blue: { icon: Droplet, label: 'Blue', iconColor: 'text-blue-400' },
  christmas: { icon: Gift, label: 'Christmas', iconColor: 'text-red-500' },
  'christmas-dark': { icon: Snowflake, label: 'Dark Xmas', iconColor: 'text-blue-300' },
  halloween: { icon: Ghost, label: 'Halloween', iconColor: 'text-orange-500' },
  // Add default entry for unknown themes
  default: { icon: Palette, label: 'Theme', iconColor: 'text-muted-foreground' },
};

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ availableThemes }) => {
  const { theme: activeTheme, setTheme } = useTheme(); // Use hook

  const handleSetTheme = (theme: Theme) => {
    setTheme(theme);
  };

  // Render nothing or a placeholder until mounted to avoid hydration mismatch
  // The ThemeProvider now handles the initial state and mounting logic.
  if (!activeTheme) {
    return <div className="h-9 w-full animate-pulse rounded-md bg-muted"></div>; // Placeholder for loading
  }

  return (
    <div className="flex items-center space-x-2 flex-wrap gap-y-2"> {/* Allow wrapping */}
       {availableThemes.map((theme) => {
          const config = themeConfig[theme] || {
              ...themeConfig.default,
              // Capitalize the first letter for the label if not defined
              label: theme.charAt(0).toUpperCase() + theme.slice(1)
            };
          const IconComponent = config.icon;
          const isActive = activeTheme === theme;

          return (
            <Button
              key={theme}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSetTheme(theme)}
              aria-pressed={isActive}
              className="flex items-center gap-2"
              title={`Switch to ${config.label} theme`}
            >
              <IconComponent className={cn("h-4 w-4", isActive ? config.iconColor : 'text-muted-foreground')} />
              {config.label}
            </Button>
          );
       })}
    </div>
  );
};

export default ThemeSwitcher;
