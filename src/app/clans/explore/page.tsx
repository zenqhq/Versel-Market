
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Compass, Search, Gamepad2, Globe, Building, ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react'; // Import AlertTriangle & CheckCircle
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  availableGames,
  getWorldRegionsForGame,
  getServersForGameAndWorld,
  getDefaultWorldForGame,
  mockClans,
  type ExplorableClan,
  type WorldRegion,
  type Server,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const ALL_SERVERS_OPTION_VALUE = "__ALL_SERVERS__";

export default function ExploreClansPage() {
  const { toast } = useToast();

  // State for Filters
  const [selectedGame, setSelectedGame] = useState<string>(availableGames[0]);
  const [availableWorlds, setAvailableWorlds] = useState<WorldRegion[]>(() => getWorldRegionsForGame(selectedGame));
  const [selectedWorld, setSelectedWorld] = useState<WorldRegion>(() => getDefaultWorldForGame(selectedGame));
  const [availableServers, setAvailableServers] = useState<Server[]>(() => getServersForGameAndWorld(selectedGame, selectedWorld));
  const [selectedServerId, setSelectedServerId] = useState<string>(ALL_SERVERS_OPTION_VALUE);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State for Join Confirmation Dialog
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedClanToJoin, setSelectedClanToJoin] = useState<ExplorableClan | null>(null);

  // Update Worlds and Servers when Game changes
  useEffect(() => {
    const newWorlds = getWorldRegionsForGame(selectedGame);
    setAvailableWorlds(newWorlds);

    const currentWorldIsValid = newWorlds.includes(selectedWorld);
    if (!currentWorldIsValid) {
      const newDefaultWorld = getDefaultWorldForGame(selectedGame);
      setSelectedWorld(newDefaultWorld);
      // Servers will be updated by the world change effect
    } else {
      // If world is still valid, update servers for the new game in the same world
      const newServers = getServersForGameAndWorld(selectedGame, selectedWorld);
      setAvailableServers(newServers);
      setSelectedServerId(ALL_SERVERS_OPTION_VALUE);
    }
    setSearchTerm('');
  }, [selectedGame, selectedWorld]); // Include selectedWorld to handle updates when world validity changes

  // Update Servers when World changes
  useEffect(() => {
    // Ensure the world is valid for the game *before* getting servers
    const newWorlds = getWorldRegionsForGame(selectedGame);
    if (!newWorlds.includes(selectedWorld)) {
        // If the selected world is not valid for the current game (e.g., after game change keeps old world)
        // Fallback to the default world for the new game
        const defaultWorld = getDefaultWorldForGame(selectedGame);
        if (selectedWorld !== defaultWorld) {
            setSelectedWorld(defaultWorld); // This will re-trigger the effect with a valid world
            return; // Avoid fetching servers with an invalid world temporarily
        }
    }
    // World is valid, proceed to get servers
    const newServers = getServersForGameAndWorld(selectedGame, selectedWorld);
    setAvailableServers(newServers);
    setSelectedServerId(ALL_SERVERS_OPTION_VALUE); // Reset server filter when world changes
  }, [selectedGame, selectedWorld]);


  // Filter Clans based on selections
  const filteredClans = useMemo(() => {
    return mockClans.filter(clan => {
      const gameMatch = clan.game === selectedGame;
      const worldMatch = clan.world === selectedWorld;
      const serverMatch = selectedServerId === ALL_SERVERS_OPTION_VALUE || clan.server === selectedServerId;
      const searchMatch = clan.name.toLowerCase().includes(searchTerm.toLowerCase());

      return gameMatch && worldMatch && serverMatch && searchMatch;
    });
  }, [selectedGame, selectedWorld, selectedServerId, searchTerm]);

  // Handlers for filter changes
  const handleSelectGame = useCallback((game: string) => {
    if (selectedGame !== game) {
      setSelectedGame(game);
      // Worlds and servers will update via useEffect hooks
    }
  }, [selectedGame]);

  const handleSelectWorld = useCallback((world: WorldRegion) => {
    if (selectedWorld !== world) {
      setSelectedWorld(world);
       // Servers will update via useEffect hook
    }
  }, [selectedWorld, selectedGame]); // Include selectedGame

  const handleSelectServer = useCallback((serverId: string) => {
    setSelectedServerId(serverId);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Helper function to get server name from ID
  const getServerNameById = (serverId: string): string => {
    // Search across all possible servers, not just currently available ones in state
    for (const game of availableGames) {
      const worlds = getWorldRegionsForGame(game);
      for (const world of worlds) {
        const servers = getServersForGameAndWorld(game, world);
        const server = servers.find(s => s.id === serverId);
        if (server) return server.name;
      }
    }
    return 'Unknown Server'; // Fallback
  }


  // Opens the confirmation dialog
  const openJoinDialog = (clan: ExplorableClan) => {
    setSelectedClanToJoin(clan);
    setIsJoinDialogOpen(true);
  };

  // Confirms the join request, shows toast, closes dialog
  const confirmJoinRequest = () => {
    if (!selectedClanToJoin) return;

    // TODO: Implement actual API call to send join request

    toast({
        title: (
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" /> {/* Success Icon */}
                <span className="font-semibold">Request Sent</span>
            </div>
        ),
        description: (
            <p>Your request to join <strong className="text-foreground">{selectedClanToJoin.name}</strong> has been sent successfully.</p>
        ),
        duration: 5000, // Slightly longer duration
    });
    setIsJoinDialogOpen(false);
    setSelectedClanToJoin(null);
  };

  // Handles closing the dialog (e.g., via Cancel button or clicking outside)
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedClanToJoin(null); // Reset selected clan when closing
    }
    setIsJoinDialogOpen(open);
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
      <Card className="w-full max-w-5xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
          <Compass className="h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-2xl">Explore Clans</CardTitle>
            <CardDescription>Find clans across different games, worlds, and servers.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            {/* Game Filter */}
            <div className="space-y-1">
                <label htmlFor="game-filter" className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Gamepad2 className="h-4 w-4"/>Game</label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button id="game-filter" variant="outline" className="w-full justify-between">
                            {selectedGame || "Select Game"}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                        {availableGames.map((game) => (
                            <DropdownMenuItem key={game} onSelect={() => handleSelectGame(game)}>
                                {game}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* World Filter */}
            <div className="space-y-1">
                 <label htmlFor="world-filter" className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Globe className="h-4 w-4"/>World</label>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button id="world-filter" variant="outline" className="w-full justify-between" disabled={!selectedGame || availableWorlds.length === 0}>
                            {selectedWorld || "Select World"}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                         {availableWorlds.map((world) => (
                            <DropdownMenuItem key={world} onSelect={() => handleSelectWorld(world)}>
                                {world}
                            </DropdownMenuItem>
                         ))}
                         {availableWorlds.length === 0 && (
                            <DropdownMenuItem disabled>No worlds for this game</DropdownMenuItem>
                         )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

             {/* Server Filter */}
             <div className="space-y-1">
                 <label htmlFor="server-filter" className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Building className="h-4 w-4"/>Server</label>
                <Select
                    value={selectedServerId}
                    onValueChange={handleSelectServer}
                    disabled={!selectedWorld || availableServers.length === 0}
                >
                    <SelectTrigger id="server-filter" className="w-full">
                    <SelectValue placeholder="All Servers" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value={ALL_SERVERS_OPTION_VALUE}>All Servers</SelectItem>
                    {availableServers.map((server) => (
                        <SelectItem key={server.id} value={server.id}>
                        {server.name}
                        </SelectItem>
                    ))}
                     {availableServers.length === 0 && selectedWorld && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No servers for this world</div>
                     )}
                    </SelectContent>
                </Select>
             </div>


             {/* Search Input */}
             <div className="space-y-1">
                 <label htmlFor="clan-search" className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Search className="h-4 w-4"/>Clan Name</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="clan-search"
                        type="search"
                        placeholder="Search by name..."
                        className="pl-9 w-full"
                        aria-label="Search for clans by name"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        disabled={!selectedGame || !selectedWorld}
                    />
                </div>
            </div>
          </div>

          {/* Clan List */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">
                Clans in {selectedGame} / {selectedWorld} {selectedServerId !== ALL_SERVERS_OPTION_VALUE ? `/ ${getServerNameById(selectedServerId)}` : '/ All Servers'}
            </h3>
            {filteredClans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClans.map((clan) => (
                  <Card key={clan.id} className="bg-muted/30 hover:bg-muted/60 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={clan.imageUrl} alt={`${clan.name} logo`} data-ai-hint="clan logo" />
                        <AvatarFallback>{clan.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{clan.name}</h4>
                        <p className="text-sm text-muted-foreground">{clan.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Members: {clan.memberCount} | Server: {getServerNameById(clan.server)} ({clan.world})
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                           {clan.recruiting ? (
                             <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                              Recruiting
                             </span>
                           ) : (
                             <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
                              Closed
                             </span>
                           )}
                         {/* Button now opens the dialog */}
                         <Button
                           size="sm"
                           variant={clan.recruiting ? "default" : "secondary"} // Use primary variant if recruiting
                           disabled={!clan.recruiting}
                           onClick={() => openJoinDialog(clan)} // Open dialog on click
                           className={cn(clan.recruiting && "shadow-md hover:shadow-lg")} // Add shadow for emphasis if recruiting
                         >
                           View & Join
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No clans found matching your criteria.</p>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Join Confirmation Dialog */}
      <AlertDialog open={isJoinDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center gap-2">
               <AlertTriangle className="h-5 w-5 text-yellow-500" /> Confirm Join Request
             </AlertDialogTitle>
             <AlertDialogDescription>
               Are you sure you want to send a join request to the clan <span className="font-semibold text-foreground">{selectedClanToJoin?.name}</span>?
             </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmJoinRequest}>Send Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
