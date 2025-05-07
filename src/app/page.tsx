
'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import CategoryFilter from '@/components/marketplace/CategoryFilter';
import ListingTable from '@/components/marketplace/ListingTable';
import {
  availableGames, // Import available games list
  getWorldRegionsForGame, // Import function to get worlds for a game
  getServersForGameAndWorld, // Import function to get servers for a game/world
  getDefaultWorldForGame, // Import function to get default world for game
  WorldRegion, // Import WorldRegion type
} from '@/lib/mock-data';
import type { Listing, Category, Server } from '@/lib/mock-data'; // Keep Server type for servers list
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Building, Globe, ChevronDown, Gamepad2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<string>(availableGames[0]);
  const [availableWorlds, setAvailableWorlds] = useState<WorldRegion[]>(() => getWorldRegionsForGame(selectedGame));
  const [selectedWorld, setSelectedWorld] = useState<WorldRegion>(() => getDefaultWorldForGame(selectedGame));
  const [serversToDisplay, setServersToDisplay] = useState<Server[]>(() => getServersForGameAndWorld(selectedGame, selectedWorld));
  const [selectedServerId, setSelectedServerId] = useState<string>(serversToDisplay[0]?.id ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- Effect to update available worlds and potentially the selected world when game changes ---
  useEffect(() => {
    const newWorlds = getWorldRegionsForGame(selectedGame);
    setAvailableWorlds(newWorlds);

    // Check if the currently selected world exists in the new game's worlds
    if (!newWorlds.includes(selectedWorld)) {
      // If the current world is not available in the new game,
      // set the selected world to the default world for the new game.
      const newDefaultWorld = getDefaultWorldForGame(selectedGame);
      // Only update state if the world actually needs to change
      if (selectedWorld !== newDefaultWorld) {
        setSelectedWorld(newDefaultWorld); // This will trigger the world change effect below
      }
    }
    // If the current world IS available in the new game, we DON'T change selectedWorld here.
    // The world change effect (below) will still run because selectedGame is a dependency,
    // and it will fetch the correct servers for the new game in the currently selected world.

    // Reset category and search term whenever the game changes
    setSelectedCategoryId('all');
    setSearchTerm('');

    // Note: Servers will be updated by the effect below which depends on selectedGame and selectedWorld
  }, [selectedGame]); // Only run when selectedGame changes


  // --- Effect to update servers when world changes OR when game changes (if world remains the same) ---
  useEffect(() => {
    // This effect now correctly handles both explicit world changes
    // and implicit updates needed when the game changes but the world selection persists.

    // Ensure the selected world is valid for the current game before fetching servers
    // (This check might be redundant due to the game change effect above, but acts as a safeguard)
    if (!availableWorlds.includes(selectedWorld)) {
        const firstValidWorld = getDefaultWorldForGame(selectedGame); // Use the correct default for the current game
         if (selectedWorld !== firstValidWorld) {
             setSelectedWorld(firstValidWorld); // Set to a valid world for the current game
             return; // Prevent fetching with invalid world momentarily; this effect will re-run
         }
    }

    // Fetch servers for the CURRENT selectedGame and CURRENT selectedWorld
    const newServers = getServersForGameAndWorld(selectedGame, selectedWorld);
    setServersToDisplay(newServers);

    // Reset server selection to the first one of the new world/game combo
    const newDefaultServerId = newServers[0]?.id ?? '';
    // Only update state if the server ID actually changes
    if (selectedServerId !== newDefaultServerId) {
      setSelectedServerId(newDefaultServerId);
    }

    // Category and search term are reset in the game change effect,
    // or persisted if only the world changes within the same game.
    // We might want to consider if category should reset on world change too.
    // For now, keeping category persistence on world change, reset on game change.

  }, [selectedGame, selectedWorld, availableWorlds]); // Depend on game, world, and the list of available worlds


  // Memoize the current server data based on selected server ID
  const currentServer = useMemo(() => {
     if (!selectedServerId) return null;
    // Find the server within the currently displayed list for the selected world/game
    return serversToDisplay.find(s => s.id === selectedServerId);
  }, [serversToDisplay, selectedServerId]);


  const handleSelectServer = useCallback((serverId: string) => {
    setSelectedServerId(serverId);
    // Keep category and search term when server changes within the same world/game
    // If category should reset on server change, add: setSelectedCategoryId('all');
  }, []);


  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

   const handleSelectWorld = (world: WorldRegion) => {
    // Only update if the world actually changed
    if (selectedWorld !== world) {
      setSelectedWorld(world);
      // Servers and server selection will be updated by the useEffect hook listening to selectedWorld
      console.log("Selected World:", world);
    }
  };

  const handleSelectGame = (game: string) => {
    // Only update if the game actually changed
    if (selectedGame !== game) {
      setSelectedGame(game);
      // Worlds, default world, servers, etc., will be updated by useEffect hooks
      console.log("Selected Game:", game);
    }
  };


  // Filter listings based on selected server, category, and search term
  const filteredListings = useMemo(() => {
    if (!currentServer) return [];

    // Check if the selected category exists in the *current* server's categories
    // If the category doesn't exist (e.g., switched server), default back to 'all' for filtering
    const categoryExistsInServer = currentServer.categories.some(c => c.id === selectedCategoryId);
    const effectiveCategoryId = categoryExistsInServer ? selectedCategoryId : 'all';

    // If the category didn't exist and we defaulted to 'all', also reset the state visually
    if (!categoryExistsInServer && selectedCategoryId !== 'all') {
        // Schedule state update after render to avoid issues
        setTimeout(() => setSelectedCategoryId('all'), 0);
    }


    return currentServer.listings.filter((listing) => {
      const categoryMatch = effectiveCategoryId === 'all' || listing.category === effectiveCategoryId;
      const searchMatch =
        listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (listing.description && listing.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return categoryMatch && searchMatch;
    });
  }, [currentServer, selectedCategoryId, searchTerm]);


  return (
    <div className="flex flex-col h-full max-h-full bg-background text-foreground overflow-hidden">
      <div className="p-4 border-b bg-background shadow-sm shrink-0 space-y-3">
        {/* Top Row: World, Search, Game Selection */}
        <div className="flex items-center gap-3">
             {/* World Region Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0" disabled={availableWorlds.length === 0}>
                    <Globe className="h-4 w-4 mr-2" />
                    {selectedWorld}
                    <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {availableWorlds.map((world) => (
                        <DropdownMenuItem key={world} onSelect={() => handleSelectWorld(world)}>
                            {world}
                        </DropdownMenuItem>
                     ))}
                     {availableWorlds.length === 0 && (
                        <DropdownMenuItem disabled>No worlds available</DropdownMenuItem>
                     )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input */}
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={`Search ${currentServer?.name ?? 'server'} on ${selectedWorld} (${selectedGame})...`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 w-full"
                    aria-label={`Search listings for ${selectedGame} on ${selectedWorld}`}
                    disabled={!currentServer}
                />
            </div>

            {/* Game Selection Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        {selectedGame}
                        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {availableGames.map((game) => (
                        <DropdownMenuItem key={game} onSelect={() => handleSelectGame(game)}>
                            {game}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Server Selection Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <Building className="h-5 w-5 text-muted-foreground shrink-0 ml-1" />
            {serversToDisplay.map((server) => (
                <Button
                  key={server.id} // Ensure IDs are unique across game/world combos in mock data
                  variant={selectedServerId === server.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSelectServer(server.id)}
                  className={cn(
                    "whitespace-nowrap transition-colors duration-150",
                    selectedServerId === server.id ? 'shadow-sm' : ''
                  )}
                  aria-pressed={selectedServerId === server.id}
                >
                  {server.name}
                </Button>
             ))}
             {serversToDisplay.length === 0 && (
                 <span className="text-muted-foreground text-sm italic">No servers found for {selectedWorld} in {selectedGame}.</span>
             )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Category Filters */}
        <aside className="w-64 border-r overflow-y-auto shrink-0 bg-card">
           <ScrollArea className="h-full">
             {currentServer ? (
                <CategoryFilter
                // Pass categories from the *currently selected server*
                categories={currentServer.categories}
                selectedCategory={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
                serverName={currentServer.name}
                />
             ) : (
                <div className="p-4 text-muted-foreground">Select a server.</div>
             )}
           </ScrollArea>
        </aside>

        {/* Main Content Area - Table */}
        <main className="flex-1 overflow-hidden">
          {currentServer ? (
             <ListingTable listings={filteredListings} />
          ) : (
            <div className="p-6 text-center text-muted-foreground">Please select a game, world, and server.</div>
          )}
        </main>
      </div>
    </div>
  );
}
