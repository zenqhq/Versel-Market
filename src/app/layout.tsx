
import type { Metadata } from 'next';
import Link from 'next/link'; // Import Link from next/link
import { Inter } from 'next/font/google'; // Using Inter as a modern sans-serif font
import './globals.css';

// --- Theme CSS Imports ---
// IMPORTANT: Manually import CSS files for new themes here
// Alternatively, a more complex dynamic import strategy could be used.
import '@/styles/themes/blue.css';
import '@/styles/themes/christmas.css';
import '@/styles/themes/christmas-dark.css';
import '@/styles/themes/halloween.css';
// Add imports for any new theme CSS files here, e.g.:
// import '@/styles/themes/my-new-theme.css';
// --- End Theme CSS Imports ---

import { cn } from '@/lib/utils'; // Import cn utility
import { Toaster } from "@/components/ui/toaster"; // Import Toaster for potential notifications
import { Package2, UserCog, Store, Star, Users, Compass, ClipboardList } from 'lucide-react'; // Import Users, Compass and ClipboardList icons
import { Button } from '@/components/ui/button'; // Import Button
import ThemeProvider from '@/components/providers/ThemeProvider'; // Import ThemeProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Define font variable

export const metadata: Metadata = {
  title: 'MaxList Marketplace', // Updated title
  description: 'A full-screen list-based marketplace.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning to prevent warnings from theme changes
    <html lang="en" className="h-full" suppressHydrationWarning={true}>
      <body
        // Add suppressHydrationWarning here too as the error pointed to the body tag
        suppressHydrationWarning={true}
        className={cn(
          'h-full min-h-screen bg-background font-sans antialiased flex flex-col', // Use flex-col to stack header and main content
          inter.variable // Apply font variable class
        )}
      >
        {/* Wrap content with ThemeProvider */}
        <ThemeProvider>
          {/* Top Options Bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 shadow-sm shrink-0">
            {/* Placeholder content for the top bar */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2" aria-label="Go to Marketplace Home">
                <Package2 className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">MaxList</span>
              </Link>
            </div>
            {/* Add other options like user menu, settings, etc. here */}
            <div className="ml-auto flex items-center gap-4">
                {/* Marketplace Button */}
                <Link href="/" passHref legacyBehavior>
                  <Button variant="outline" size="sm" asChild>
                    <a> {/* Use anchor tag inside Button with asChild */}
                      <Store className="h-4 w-4 mr-2" />
                      Marketplace
                    </a>
                  </Button>
                </Link>

                 {/* Clans Button */}
                 <Link href="/clans" passHref legacyBehavior>
                  <Button variant="outline" size="sm" asChild>
                    <a>
                      <Users className="h-4 w-4 mr-2" />
                      My Clan
                    </a>
                  </Button>
                </Link>

                {/* Explore Clans Button */}
                 <Link href="/clans/explore" passHref legacyBehavior>
                  <Button variant="outline" size="sm" asChild>
                    <a>
                      <Compass className="h-4 w-4 mr-2" />
                      Explore Clans
                    </a>
                  </Button>
                </Link>

                {/* Premium Button */}
                {/* Added class premium-button-nav for theme targeting */}
                <Link href="/premium" passHref legacyBehavior>
                  <Button variant="outline" size="sm" asChild className="premium-button-nav">
                    <a>
                      <Star className="h-4 w-4 mr-2" />
                      Premium
                    </a>
                  </Button>
                </Link>

                {/* Administration Button */}
                <Link href="/admin" passHref legacyBehavior>
                  <Button variant="outline" size="sm" asChild>
                    <a> {/* Use anchor tag inside Button with asChild */}
                      <UserCog className="h-4 w-4 mr-2" />
                      Administration
                    </a>
                  </Button>
                </Link>


                {/* Add other options like user menu, settings, etc. here */}
                {/* Example Placeholder for Settings */}
                {/* <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button> */}
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden"> {/* Allow main content to take remaining space and handle overflow */}
              {children}
          </div>
          <Toaster /> {/* Add Toaster for notifications */}
        </ThemeProvider>
      </body>
    </html>
  );
}
