import { promises as fs } from 'fs';
import path from 'path';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Star, Palette } from 'lucide-react'; // Import Palette icon for Themes
import ThemeSwitcher from "@/components/premium/ThemeSwitcher"; // Import the ThemeSwitcher component
import type { Theme } from '@/components/providers/ThemeProvider'; // Import Theme type

// Function to get available themes from the filesystem
async function getAvailableThemes(): Promise<Theme[]> {
  // Base themes that are always available
  const baseThemes: Theme[] = ['light', 'dark'];
  const themesDir = path.join(process.cwd(), 'src/styles/themes');
  try {
    const files = await fs.readdir(themesDir);
    const cssFiles = files.filter(file => file.endsWith('.css'));
    const customThemes = cssFiles.map(file => path.basename(file, '.css') as Theme); // Extract theme name from filename
    // Ensure 'light' and 'dark' are not duplicated if files exist for them
    const uniqueThemes = [...baseThemes, ...customThemes.filter(theme => !baseThemes.includes(theme))];
    return uniqueThemes;
  } catch (error) {
    console.error("Error reading themes directory:", error);
    // Fallback to base themes if directory reading fails
    return baseThemes;
  }
}

export default async function PremiumPage() {
  const availableThemes = await getAvailableThemes();

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <Star className="h-8 w-8 text-yellow-500" />
          <div>
            <CardTitle className="text-2xl">Premium Features</CardTitle>
            <CardDescription>Unlock exclusive benefits and features.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid gap-6"> {/* Use grid for better layout */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Premium Benefits</h3>
            <p className="text-muted-foreground mb-4">
              Details about premium plans and features will be available here soon.
            </p>
            {/* Placeholder for future premium components/sections */}
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Enhanced listing visibility</li>
              <li>Advanced search filters</li>
              <li>Priority support</li>
              <li>Exclusive marketplace insights</li>
            </ul>
          </div>

          {/* Themes Section */}
          <div className="border-t pt-6">
             <div className="flex items-center justify-between gap-3 mb-2"> {/* Use justify-between */}
                <div className="flex items-center gap-3">
                    <Palette className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Appearance Themes</h3>
                </div>
             </div>
            <p className="text-muted-foreground mb-4">
              Customize the look and feel of the marketplace. Select your preferred theme below. New themes added to the `src/styles/themes` folder will appear automatically.
            </p>
            {/* Render the ThemeSwitcher component, passing available themes */}
            <ThemeSwitcher availableThemes={availableThemes} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
