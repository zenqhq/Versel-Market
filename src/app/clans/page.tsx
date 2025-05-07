'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, PlusCircle, LogIn, Crown, User as UserIconLucide, Trash2, AlertTriangle, CalendarDays as CalendarIconLucide, Home, Image as ImageIcon, Clock, Filter, Pencil, CheckCircle, Sword, Shield, Heart, Wand2, Crosshair, ClipboardList, GripVertical, Maximize, Minimize } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import CreateEventDialog from '@/components/clans/CreateEventDialog';
import type { ClanEventData } from '@/components/clans/CreateEventDialog';
import { format, getDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import DraggableMemberItem from '@/components/clans/DraggableMemberItem';
import DroppableTeamArea from '@/components/clans/DroppableTeamArea';


export type GameRole = 'Melee DPS' | 'Magic DPS' | 'Ranged DPS' | 'Tank' | 'Healer';

export interface ClanMember {
  id: string;
  name: string;
  role: 'Leader' | 'Member';
  avatarUrl?: string;
  gameRole: GameRole;
}

interface ClanInfo {
  name: string;
  description: string;
  members: ClanMember[];
  imageUrl?: string;
}

type ActiveClanTab = 'home' | 'events' | 'planning';
type DayOfWeekFilter = 'all' | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ClanEvent extends ClanEventData {
    id: string;
    date?: Date;
    time?: string;
    imageUrl?: string;
}

const exampleEvents: ClanEvent[] = [
  {
    id: 'event-example-1',
    name: 'Weekly Guild Raid - Level 80',
    description: 'Meeting at the Dragon\'s Lair entrance. Bring potions and be on time!',
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    time: '20:00',
    imageUrl: 'https://picsum.photos/seed/raidnight/200',
  },
  {
    id: 'event-example-2',
    name: 'Clan PvP Tournament',
    description: 'Sign up in the Discord channel. Prizes for the top 3!',
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    time: '15:30',
    imageUrl: 'https://picsum.photos/seed/pvptournament/200',
  },
  {
    id: 'event-example-3',
    name: 'Crafting Workshop: Master Armor',
    description: 'Learn advanced armor crafting techniques from our master smith.',
    date: new Date(new Date().setDate(new Date().getDate() + 10)),
    imageUrl: 'https://picsum.photos/seed/craftworkshop/200',
  },
  {
    id: 'event-example-saturday',
    name: 'Saturday Social Gathering',
    description: 'Relax and chat with clanmates at the tavern.',
    date: new Date(new Date().setDate(new Date().getDate() + (6 - getDay(new Date()) + 7) % 7)), // Next Saturday
    time: '19:00',
    imageUrl: 'https://picsum.photos/seed/saturdaytavern/200',
  },
  {
    id: 'event-example-sunday',
    name: 'Sunday World Boss Hunt',
    description: 'Let\'s take down the world boss together!',
    date: new Date(new Date().setDate(new Date().getDate() + (0 - getDay(new Date()) + 7) % 7)), // Next Sunday
    time: '14:00',
    imageUrl: 'https://picsum.photos/seed/sundayboss/200',
  },
];

const daysOfWeek = [
    { name: 'Sunday', value: 0 },
    { name: 'Monday', value: 1 },
    { name: 'Tuesday', value: 2 },
    { name: 'Wednesday', value: 3 },
    { name: 'Thursday', value: 4 },
    { name: 'Friday', value: 5 },
    { name: 'Saturday', value: 6 },
];

export const gameRoleIcons: Record<GameRole, React.ElementType> = {
  'Melee DPS': Sword,
  'Magic DPS': Wand2,
  'Ranged DPS': Crosshair,
  Tank: Shield,
  Healer: Heart,
};

interface TeamSlot {
  id: string;
  name: string;
}

const initialTeamSlots: TeamSlot[] = [
  { id: 'team1', name: 'Team 1' },
  { id: 'team2', name: 'Team 2' },
  { id: 'team3', name: 'Team 3' },
  { id: 'team4', name: 'Team 4' },
];


export default function ClansPage() {
  const { toast } = useToast();
  const [createdClan, setCreatedClan] = useState<ClanInfo | null>(null);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [confirmClanNameInput, setConfirmClanNameInput] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [activeClanTab, setActiveClanTab] = useState<ActiveClanTab>('home');
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ClanEvent | null>(null);
  const [clanEvents, setClanEvents] = useState<ClanEvent[]>([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeekFilter>('all');

  // State for Planning Tab
  const [currentTeamSlots, setCurrentTeamSlots] = useState<TeamSlot[]>(initialTeamSlots);
  const [teamAssignments, setTeamAssignments] = useState<Record<string, string[]>>(
    initialTeamSlots.reduce((acc, team) => ({ ...acc, [team.id]: [] }), {})
  );
  const [availableMembersForPlanning, setAvailableMembersForPlanning] = useState<ClanMember[]>([]);
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<'available' | string | null>(null); // 'available' or teamId
  const [teamToDelete, setTeamToDelete] = useState<TeamSlot | null>(null);
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [newTeamNameInput, setNewTeamNameInput] = useState("");
  const [newTeamNameError, setNewTeamNameError] = useState<string | null>(null);
  const [isPlanningFullScreen, setIsPlanningFullScreen] = useState(false);


  useEffect(() => {
    if (createdClan) {
      const allAssignedMemberIds = Object.values(teamAssignments).flat();
      const unassigned = createdClan.members.filter(m => !allAssignedMemberIds.includes(m.id));
      setAvailableMembersForPlanning(unassigned);
    } else {
      setAvailableMembersForPlanning([]);
       // When no clan, reset team assignments and slots to initial, not empty
      setTeamAssignments(initialTeamSlots.reduce((acc, team) => ({ ...acc, [team.id]: [] }), {}));
      setCurrentTeamSlots(initialTeamSlots);
    }
  }, [createdClan, teamAssignments]);


  const handleCreateClan = () => {
    const mockClan: ClanInfo = {
      name: "The Dragon Guard",
      description: "Guardians of the ancient flame.",
      imageUrl: `https://picsum.photos/seed/dragonguardclan/200`,
      members: [
        { id: 'user1', name: "You", role: 'Leader', avatarUrl: `https://picsum.photos/seed/user1/150`, gameRole: 'Tank' },
        { id: 'user2', name: "Aragorn", role: 'Member', avatarUrl: `https://picsum.photos/seed/user2/150`, gameRole: 'Melee DPS' },
        { id: 'user3', name: "Legolas", role: 'Member', avatarUrl: `https://picsum.photos/seed/user3/150`, gameRole: 'Ranged DPS' },
        { id: 'user4', name: "Gimli", role: 'Member', avatarUrl: `https://picsum.photos/seed/user4/150`, gameRole: 'Tank' },
        { id: 'user5', name: "Gandalf", role: 'Member', avatarUrl: `https://picsum.photos/seed/user5/150`, gameRole: 'Magic DPS' },
        { id: 'user6', name: "Frodo", role: 'Member', avatarUrl: `https://picsum.photos/seed/user6/150`, gameRole: 'Ranged DPS' },
        { id: 'user7', name: "Galadriel", role: 'Member', avatarUrl: `https://picsum.photos/seed/user7/150`, gameRole: 'Healer' },
        { id: 'user8', name: "Boromir", role: 'Member', avatarUrl: `https://picsum.photos/seed/user8/150`, gameRole: 'Melee DPS' },
        { id: 'user9', name: "Samwise", role: 'Member', avatarUrl: `https://picsum.photos/seed/user9/150`, gameRole: 'Healer' },
      ],
    };
    setCreatedClan(mockClan);
    setClanEvents(exampleEvents);
    setActiveClanTab('home');
    // Reset team structures to initial state for the new clan
    setCurrentTeamSlots(initialTeamSlots);
    setTeamAssignments(initialTeamSlots.reduce((acc, team) => ({ ...acc, [team.id]: [] }), {}));
  };

  const confirmLeaveDisbandClan = () => {
    if (createdClan && confirmClanNameInput === createdClan.name) {
      setCreatedClan(null);
      setClanEvents([]);
      setIsLeaveDialogOpen(false);
      setConfirmClanNameInput("");
      setConfirmError(null);
      // Reset planning tab state
      setCurrentTeamSlots(initialTeamSlots);
      setTeamAssignments(initialTeamSlots.reduce((acc, team) => ({ ...acc, [team.id]: [] }), {}));
      setAvailableMembersForPlanning([]);
    } else {
      setConfirmError("Clan name does not match.");
    }
  };

  const handleDialogClose = (open: boolean) => {
      if (!open) {
          setConfirmClanNameInput("");
          setConfirmError(null);
      }
      setIsLeaveDialogOpen(open);
  }

  const handleCreateEvent = () => {
    setEventToEdit(null);
    setIsCreateEventDialogOpen(true);
  };

  const handleConfirmCreateOrEditEvent = (eventData: ClanEventData) => {
    if (eventData.id) {
        handleConfirmEditEvent(eventData as ClanEvent);
    } else {
        handleConfirmCreateEvent(eventData);
    }
  };

  const handleConfirmCreateEvent = (eventData: ClanEventData) => {
    const newEvent: ClanEvent = {
        ...eventData,
        id: `event-${Date.now()}`,
        imageUrl: eventData.imageUrl || `https://picsum.photos/seed/event${Date.now()}/200`,
    };
    setClanEvents(prevEvents => [...prevEvents, newEvent].sort((a, b) => {
        if (a.date && b.date) return a.date.getTime() - b.date.getTime();
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
    }));
  };

  const handleConfirmEditEvent = (updatedEventData: ClanEvent) => {
    setClanEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEventData.id ? { ...event, ...updatedEventData, imageUrl: updatedEventData.imageUrl || event.imageUrl || `https://picsum.photos/seed/event${Date.now()}/200` } : event
      ).sort((a, b) => {
        if (a.date && b.date) return a.date.getTime() - b.date.getTime();
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
      })
    );
    setIsEditEventDialogOpen(false);
    setEventToEdit(null);
  };


  const filteredEvents = useMemo(() => {
    if (selectedDayFilter === 'all') {
      return clanEvents;
    }
    return clanEvents.filter(event => {
      if (!event.date) {
        return false;
      }
      return getDay(event.date) === selectedDayFilter;
    });
  }, [clanEvents, selectedDayFilter]);

  const handleEditEvent = (eventId: string) => {
    const event = clanEvents.find(e => e.id === eventId);
    if (event) {
      setEventToEdit(event);
      setIsEditEventDialogOpen(true);
    }
  };

  const handleDeleteEvent = (eventId: string, eventName: string) => {
    setClanEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    toast({
      variant: "destructive",
      title: "Event Deleted",
      description: `Event "${eventName}" has been removed.`,
    });
  };

  // Drag and Drop Handlers
  const handleDragStartMember = useCallback((event: React.DragEvent<HTMLDivElement>, memberId: string, source: 'available' | string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('memberId', memberId);
    event.dataTransfer.setData('source', source);
    setDraggedMemberId(memberId);
    setDragSource(source);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropOnTeam = useCallback((event: React.DragEvent<HTMLDivElement>, targetTeamId: string) => {
    event.preventDefault();
    const memberId = event.dataTransfer.getData('memberId');
    const source = event.dataTransfer.getData('source');

    if (!memberId) return;

    setTeamAssignments(prev => {
      const newAssignments = { ...prev };
      // Remove from source if it's a team
      if (source !== 'available' && newAssignments[source]) {
        newAssignments[source] = newAssignments[source].filter(id => id !== memberId);
      }
      // Add to target team, ensuring no duplicates
      if (newAssignments[targetTeamId] && !newAssignments[targetTeamId].includes(memberId)) {
        newAssignments[targetTeamId] = [...newAssignments[targetTeamId], memberId];
      }
      return newAssignments;
    });
    setDraggedMemberId(null);
    setDragSource(null);
  }, []);

  const handleDropOnAvailable = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const memberId = event.dataTransfer.getData('memberId');
    const sourceTeamId = event.dataTransfer.getData('source');

    if (!memberId || sourceTeamId === 'available') return; // Only move from a team to available

    setTeamAssignments(prev => {
      const newAssignments = { ...prev };
      if (newAssignments[sourceTeamId]) {
        newAssignments[sourceTeamId] = newAssignments[sourceTeamId].filter(id => id !== memberId);
      }
      return newAssignments;
    });
    setDraggedMemberId(null);
    setDragSource(null);
  }, []);


  const getMemberById = useCallback((memberId: string): ClanMember | undefined => {
    return createdClan?.members.find(m => m.id === memberId);
  }, [createdClan]);

  const handleAddTeam = () => {
    // Open dialog to get team name
    setNewTeamNameInput("");
    setNewTeamNameError(null);
    setIsAddTeamDialogOpen(true);
  };

  const confirmAddTeam = () => {
    const teamName = newTeamNameInput.trim();
    if (!teamName) {
      setNewTeamNameError("Team name cannot be empty.");
      return;
    }
    // Check for duplicate team names (optional, but good practice)
    if (currentTeamSlots.some(slot => slot.name.toLowerCase() === teamName.toLowerCase())) {
        setNewTeamNameError("A team with this name already exists.");
        return;
    }


    const newTeam: TeamSlot = {
      id: `team-${Date.now()}`, // Use timestamp for unique ID
      name: teamName,
    };
    setCurrentTeamSlots(prevSlots => [...prevSlots, newTeam]);
    setTeamAssignments(prevAssignments => ({
      ...prevAssignments,
      [newTeam.id]: [],
    }));
    toast({
        title: (
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Team Added</span>
            </div>
        ),
        description: `Team "${teamName}" has been successfully created.`,
    });
    setIsAddTeamDialogOpen(false);
    setNewTeamNameInput(""); // Reset input
    setNewTeamNameError(null);
  };


  const openDeleteTeamDialog = (team: TeamSlot) => {
    setTeamToDelete(team);
  };

  const confirmDeleteTeam = () => {
    if (!teamToDelete) return;

    const teamIdToDelete = teamToDelete.id;
    const teamName = teamToDelete.name;

    // Update team slots (remove the team)
    setCurrentTeamSlots(prevSlots => prevSlots.filter(slot => slot.id !== teamIdToDelete));

    // Update team assignments (remove the team's entry)
    // Members will be moved to availableMembersForPlanning by the useEffect hook
    setTeamAssignments(prevAssignments => {
        const newAssignments = { ...prevAssignments };
        delete newAssignments[teamIdToDelete];
        return newAssignments;
    });

    toast({
        variant: "destructive",
        title: "Team Deleted",
        description: `Team "${teamName}" has been removed. Its members are now available.`,
    });
    setTeamToDelete(null); // Close dialog
  };


  return (
    <div className={cn(
        "flex flex-1 flex-col h-full",
        createdClan && !isPlanningFullScreen ? "p-0" : "p-4 md:p-6 lg:p-8",
        isPlanningFullScreen && activeClanTab === 'planning' && "fixed inset-0 z-50 bg-background p-0"
    )}>
      <Card className={cn(
        "w-full shadow-lg flex flex-col flex-1 overflow-hidden",
        isPlanningFullScreen && activeClanTab === 'planning' && "h-full rounded-none border-0"
      )}>
         {!createdClan && (
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-4 shrink-0">
                 <div className="flex items-center gap-4">
                   <Users className="h-8 w-8 text-primary" />
                   <div>
                     <CardTitle className="text-2xl">My Clan</CardTitle>
                     <CardDescription>Manage your current clan and members.</CardDescription>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button size="sm" onClick={handleCreateClan}>
                     <PlusCircle className="mr-2 h-4 w-4" /> Create Clan
                   </Button>
                   <Button variant="secondary" size="sm">
                     <LogIn className="mr-2 h-4 w-4" /> Join Clan
                   </Button>
                 </div>
             </CardHeader>
          )}
        <CardContent className={cn(
            "flex flex-col flex-1 overflow-hidden",
            createdClan && !isPlanningFullScreen ? "p-0" : "pt-6",
            isPlanningFullScreen && activeClanTab === 'planning' && "p-0"
        )}>
          {!createdClan ? (
            <div className="space-y-6 flex-1 pt-6 px-6">
              <p className="text-muted-foreground mb-6">
                You are not currently in a clan. Use the buttons above to create a new clan or join an existing one. You can also explore available clans.
              </p>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clan Features (Coming Soon)</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Member Management</li>
                  <li>Clan Wars & Events</li>
                  <li>Clan Bank / Treasury</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col flex-1 overflow-hidden">
              {(!isPlanningFullScreen || activeClanTab !== 'planning') && (
                <>
                  <div className="flex items-start justify-between gap-4 shrink-0 border-b pb-4 px-6 pt-6">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={createdClan.imageUrl} alt={`${createdClan.name} logo`} data-ai-hint="clan emblem" />
                          <AvatarFallback>{createdClan.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold mb-1">{createdClan.name}</h2>
                          <p className="text-muted-foreground">{createdClan.description}</p>
                        </div>
                      </div>
                      <AlertDialog open={isLeaveDialogOpen} onOpenChange={handleDialogClose}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" /> Leave / Disband
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Clan Disband/Leave
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is irreversible. To confirm, please type the name of your clan: <span className="font-semibold text-foreground">{createdClan.name}</span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-2 my-4">
                            <Label htmlFor="clanNameConfirm" className="text-right">
                              Clan Name
                            </Label>
                            <Input
                              id="clanNameConfirm"
                              value={confirmClanNameInput}
                              onChange={(e) => {
                                  setConfirmClanNameInput(e.target.value);
                                  if (confirmError) setConfirmError(null);
                              }}
                              placeholder="Enter clan name to confirm"
                              className={confirmError ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            {confirmError && (
                                <p className="text-sm text-destructive">{confirmError}</p>
                            )}
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmLeaveDisbandClan}
                                disabled={confirmClanNameInput !== createdClan.name}
                            >
                                Confirm Leave/Disband
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>

                  <div className="mt-4 shrink-0 flex gap-2 px-6">
                    <Button
                      variant={activeClanTab === 'home' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveClanTab('home')}
                      aria-pressed={activeClanTab === 'home'}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Button>
                    <Button
                      variant={activeClanTab === 'events' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveClanTab('events')}
                      aria-pressed={activeClanTab === 'events'}
                    >
                      <CalendarIconLucide className="mr-2 h-4 w-4" />
                      Events
                    </Button>
                    <Button
                      variant={activeClanTab === 'planning' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveClanTab('planning')}
                      aria-pressed={activeClanTab === 'planning'}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Planning
                    </Button>
                  </div>
                </>
              )}

              {activeClanTab === 'home' && (
                  <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="pr-4 space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Members ({createdClan.members.length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {createdClan.members.map((member) => {
                            const GameRoleIcon = gameRoleIcons[member.gameRole];
                            return (
                              <div key={member.id} className="flex items-center gap-3 p-3 border rounded-md bg-card hover:bg-muted/50 transition-colors">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="character portrait" />
                                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{member.name}</p>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    {member.role === 'Leader' ? (
                                      <Crown className="h-4 w-4 mr-1 text-yellow-500" />
                                    ) : (
                                      <UserIconLucide className="h-4 w-4 mr-1" />
                                    )}
                                    {member.role}
                                  </div>
                                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                    <GameRoleIcon className={cn("h-3.5 w-3.5 mr-1", {
                                      'text-red-500': member.gameRole === 'Melee DPS',
                                      'text-purple-500': member.gameRole === 'Magic DPS',
                                      'text-yellow-600': member.gameRole === 'Ranged DPS',
                                      'text-blue-500': member.gameRole === 'Tank',
                                      'text-green-500': member.gameRole === 'Healer',
                                    })} />
                                    {member.gameRole}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
              )}

              {activeClanTab === 'events' && (
                <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="flex-1 flex flex-col space-y-4 pt-0 border-t mt-4 -mx-6 px-6 pt-6">
                      <div className="flex justify-between items-center sticky top-0 bg-background py-4 z-10 -mx-6 px-6 border-b">
                        <div className="flex flex-col">
                             <h3 className="text-lg font-semibold">Upcoming Events</h3>
                        </div>
                         <Button size="sm" onClick={handleCreateEvent}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                         </Button>
                      </div>

                       <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b mb-4">
                          <Filter className="h-5 w-5 text-muted-foreground shrink-0 ml-1" />
                          <Button
                            variant={selectedDayFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedDayFilter('all')}
                            className={cn("whitespace-nowrap transition-colors duration-150", selectedDayFilter === 'all' ? 'shadow-sm' : '')}
                            aria-pressed={selectedDayFilter === 'all'}
                          >
                            All Days
                          </Button>
                          {daysOfWeek.map((day) => {
                            const isWeekend = day.value === 0 || day.value === 6;
                            const isSelected = selectedDayFilter === day.value;
                            return (
                              <Button
                                key={day.value}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedDayFilter(day.value as DayOfWeekFilter)}
                                className={cn(
                                  "whitespace-nowrap transition-colors duration-150",
                                  isSelected ? 'shadow-sm' : '',
                                  !isSelected && isWeekend && 'border-primary text-primary/80 hover:bg-primary/10 hover:text-primary',
                                  !isSelected && !isWeekend && 'border-input text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                                )}
                                aria-pressed={isSelected}
                              >
                                {day.name}
                              </Button>
                            );
                          })}
                       </div>

                      {filteredEvents.length === 0 ? (
                         <div className="flex-1 flex items-center justify-center text-muted-foreground pt-10">
                           <p>No events found for the selected day. Try 'All Days' or create a new event!</p>
                         </div>
                      ) : (
                        <div className="space-y-4">
                            {filteredEvents.map((event, index) => (
                                <Card
                                    key={event.id}
                                    className={cn(
                                        "bg-muted/30 flex flex-col sm:flex-row gap-4 p-4 items-start",
                                        index === 0 && selectedDayFilter === 'all' && "border-2 border-primary bg-card"
                                    )}
                                >
                                    {event.imageUrl ? (
                                        <div className="w-full sm:w-24 h-32 sm:h-24 relative shrink-0 rounded-md overflow-hidden">
                                            <Image
                                                src={event.imageUrl}
                                                alt={`Image for ${event.name}`}
                                                layout="fill"
                                                objectFit="cover"
                                                data-ai-hint="event banner"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full sm:w-24 h-32 sm:h-24 flex items-center justify-center bg-muted rounded-md shrink-0">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-semibold mb-1">{event.name}</h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mb-1">
                                            {event.date && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <CalendarIconLucide className="h-4 w-4"/>
                                                    {format(event.date, 'PP')}
                                                </p>
                                            )}
                                            {event.time && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-4 w-4"/>
                                                    {event.time}
                                                </p>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 mt-2 sm:mt-0 sm:ml-auto shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditEvent(event.id)}
                                            className="w-full sm:w-auto"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Deletion
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the event "{event.name}"? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteEvent(event.id, event.name)}>
                                                        Delete Event
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </Card>
                            ))}
                        </div>
                      )}
                    </div>
                </ScrollArea>
              )}

              {activeClanTab === 'planning' && createdClan && (
                 <div className={cn(
                    "flex-1 flex flex-col space-y-4 pt-0 overflow-hidden",
                    isPlanningFullScreen
                        ? "p-6" 
                        : "border-t mt-4 -mx-6 px-6 pt-6"
                )}>
                   <div className={cn(
                        "flex justify-between items-center bg-background py-4 z-10",
                        isPlanningFullScreen
                            ? "px-0 border-b" 
                            : "-mx-6 px-6 border-b sticky top-0"
                   )}>
                     <h3 className="text-lg font-semibold">Team Planning</h3>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsPlanningFullScreen(!isPlanningFullScreen)} title={isPlanningFullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
                          {isPlanningFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                          <span className="sr-only">{isPlanningFullScreen ? "Exit Full Screen" : "Full Screen"}</span>
                        </Button>
                        <Button size="sm" onClick={handleAddTeam}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Team
                        </Button>
                      </div>
                   </div>
                   <div className="flex flex-1 gap-4 overflow-hidden pb-4">
                      {/* Available Members Column */}
                      <Card
                        className="w-1/3 flex flex-col"
                        onDrop={handleDropOnAvailable}
                        onDragOver={handleDragOver}
                      >
                        <CardHeader className="py-3 px-4 border-b bg-muted/50">
                          <CardTitle className="text-md font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary"/>
                            Available Members
                            <span className="text-md font-semibold text-muted-foreground ml-1">({availableMembersForPlanning.length})</span>
                          </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                          <CardContent className="p-3 space-y-2">
                            {availableMembersForPlanning.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">No members available.</p>
                            )}
                            {availableMembersForPlanning.map(member => (
                              <DraggableMemberItem
                                key={member.id}
                                member={member}
                                onDragStart={(e, memberId) => handleDragStartMember(e, memberId, 'available')}
                                gameRoleIcons={gameRoleIcons}
                                className={cn(draggedMemberId === member.id && dragSource === 'available' && "opacity-50 ring-2 ring-primary")}
                              />
                            ))}
                          </CardContent>
                        </ScrollArea>
                      </Card>

                      {/* Team Columns */}
                      <div className="w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-1"> {/* Increased gap to gap-6 */}
                        {currentTeamSlots.map(team => (
                          <DroppableTeamArea
                            key={team.id}
                            teamSlot={team}
                            assignedMemberIds={teamAssignments[team.id] || []}
                            onDrop={handleDropOnTeam}
                            onDragOver={handleDragOver}
                            onMemberDragStart={(e, memberId, sourceTeamId) => handleDragStartMember(e, memberId, sourceTeamId)}
                            gameRoleIcons={gameRoleIcons}
                            getMemberById={getMemberById}
                            draggedMemberId={draggedMemberId}
                            onDeleteTeam={() => openDeleteTeamDialog(team)}
                          />
                        ))}
                      </div>
                   </div>
                 </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

        <CreateEventDialog
            open={isCreateEventDialogOpen || isEditEventDialogOpen}
            onOpenChange={(open) => {
                if (isEditEventDialogOpen && !open) {
                    setIsEditEventDialogOpen(false);
                    setEventToEdit(null);
                } else {
                    setIsCreateEventDialogOpen(open);
                }
            }}
            onCreateEvent={handleConfirmCreateOrEditEvent}
            initialEventData={eventToEdit ?? undefined}
            isEditing={isEditEventDialogOpen}
        />

        {/* Confirm Delete Team Dialog */}
        <AlertDialog open={!!teamToDelete} onOpenChange={(open) => !open && setTeamToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" /> Confirm Team Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the team "{teamToDelete?.name}"? Members in this team will become available.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setTeamToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteTeam}>
                        Delete Team
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

         {/* Add Team Dialog */}
        <AlertDialog open={isAddTeamDialogOpen} onOpenChange={(open) => {
            if (!open) {
                setNewTeamNameInput("");
                setNewTeamNameError(null);
            }
            setIsAddTeamDialogOpen(open);
        }}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary" /> Add New Team
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a name for the new team.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 my-4">
                    <Label htmlFor="newTeamName" className="text-right">
                        Team Name
                    </Label>
                    <Input
                        id="newTeamName"
                        value={newTeamNameInput}
                        onChange={(e) => {
                            setNewTeamNameInput(e.target.value);
                            if (newTeamNameError) setNewTeamNameError(null);
                        }}
                        placeholder="Enter team name"
                        className={newTeamNameError ? 'border-destructive focus-visible:ring-destructive' : ''}
                        autoFocus
                    />
                    {newTeamNameError && (
                        <p className="text-sm text-destructive">{newTeamNameError}</p>
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                        setIsAddTeamDialogOpen(false);
                        setNewTeamNameInput("");
                        setNewTeamNameError(null);
                    }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmAddTeam} disabled={!newTeamNameInput.trim()}>
                        Create Team
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
