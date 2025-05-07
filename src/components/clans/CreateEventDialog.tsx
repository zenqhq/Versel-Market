'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarPlus, CheckCircle, Calendar as CalendarIcon, ImagePlus, HelpCircle, Clock, Pencil } from 'lucide-react'; // Added Pencil for edit
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClanEvent } from '@/app/clans/page'; // Import ClanEvent type

// Define the structure for the event data including optional date, time and image URL
export interface ClanEventData {
  id?: string; // Optional ID, will be present if editing
  name: string;
  description: string;
  date?: Date;
  time?: string;
  imageUrl?: string;
}

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateEvent: (eventData: ClanEventData) => void;
  initialEventData?: ClanEvent; // Optional: For pre-filling form for editing
  isEditing?: boolean; // Optional: Flag to indicate edit mode
}

export default function CreateEventDialog({
  open,
  onOpenChange,
  onCreateEvent,
  initialEventData,
  isEditing = false,
}: CreateEventDialogProps) {
  const { toast } = useToast();
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');

  // Effect to pre-fill form when in editing mode and initialData is provided
  useEffect(() => {
    if (isEditing && initialEventData) {
      setEventName(initialEventData.name);
      setEventDescription(initialEventData.description || '');
      setEventDate(initialEventData.date ? new Date(initialEventData.date) : undefined);
      setEventTime(initialEventData.time || '');
      setEventImageUrl(initialEventData.imageUrl || '');
    } else {
      // Reset form if not editing or no initial data (e.g., dialog was closed)
      resetForm();
    }
  }, [isEditing, initialEventData, open]); // Rerun if 'open' changes to reset form when re-opening for create

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Event name cannot be empty.",
      });
      return;
    }

    if (eventImageUrl && !eventImageUrl.startsWith('https://media.discordapp.net/') && !eventImageUrl.startsWith('https://cdn.discordapp.com/')) {
       toast({
           variant: "destructive",
           title: "Invalid Image URL",
           description: "Please use a valid image link from Discord (starting with https://media.discordapp.net/ or https://cdn.discordapp.com/).",
       });
       return;
    }

    const eventDataToSubmit: ClanEventData = {
      id: isEditing ? initialEventData?.id : undefined, // Include ID if editing
      name: eventName,
      description: eventDescription,
      date: eventDate,
      time: eventTime || undefined,
      imageUrl: eventImageUrl || undefined,
    };

    onCreateEvent(eventDataToSubmit); // This callback will now handle both create and update

    toast({
      title: (
          <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold">{isEditing ? "Event Updated" : "Event Created"}</span>
          </div>
      ),
      description: `The event "${eventName}" has been ${isEditing ? "updated" : "scheduled"}.`,
      duration: 4000,
    });

    if (!isEditing) { // Only reset form completely if creating a new event
      resetForm();
    }
    onOpenChange(false); // Close dialog
  };

  const resetForm = () => {
    setEventName('');
    setEventDescription('');
    setEventDate(undefined);
    setEventTime('');
    setEventImageUrl('');
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      // If not editing, or if it's closed without submission, reset form
      // If editing, fields remain for next potential open unless submitted
      // The useEffect above handles resetting if it's opened for 'create' after 'edit'
       if (!isEditing) resetForm();
    }
    onOpenChange(isOpen);
  };

  const DialogIcon = isEditing ? Pencil : CalendarPlus;
  const dialogTitleText = isEditing ? "Edit Clan Event" : "Create New Clan Event";
  const submitButtonText = isEditing ? "Save Changes" : "Create Event";

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DialogIcon className="h-5 w-5" /> {dialogTitleText}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the details of the event below." : "Fill in the details below to schedule a new event for your clan."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="event-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="event-name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Weekly Raid Night"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="event-description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="event-description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional: Add details about the event..."
                  rows={3}
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="event-date" className="text-right">
                   Date
                 </Label>
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button
                       variant={"outline"}
                       className={cn(
                         "col-span-3 justify-start text-left font-normal",
                         !eventDate && "text-muted-foreground"
                       )}
                     >
                       <CalendarIcon className="mr-2 h-4 w-4" />
                       {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <Calendar
                       mode="single"
                       selected={eventDate}
                       onSelect={setEventDate}
                       initialFocus
                     />
                   </PopoverContent>
                 </Popover>
               </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="event-time" className="text-right">
                        Time
                    </Label>
                    <div className="col-span-3 relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="event-time"
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                            className="pl-9"
                            placeholder="HH:MM"
                        />
                    </div>
                </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <div className="flex items-center justify-end gap-1">
                     <Label htmlFor="event-image-url" className="text-right">
                       Image URL
                     </Label>
                     <TooltipProvider delayDuration={100}>
                         <Tooltip>
                             <TooltipTrigger type="button">
                                 <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                             </TooltipTrigger>
                             <TooltipContent side="top" className="max-w-xs">
                                 <p className="text-sm">
                                     Optional: Paste an image link from Discord.
                                     <br />
                                     1. Upload image to any Discord channel.
                                     <br />
                                     2. Left-Click the image to open it in fullscreen/zoom view.
                                     <br />
                                     3. Right-click the zoomed image.
                                     <br />
                                     4. Select "Copy image address" or "Copy link".
                                     <br />
                                     5. Paste the link here (should start with `https://media.discordapp.net/` or `https://cdn.discordapp.com/`).
                                 </p>
                             </TooltipContent>
                         </Tooltip>
                     </TooltipProvider>
                 </div>
                <div className="col-span-3 relative">
                    <ImagePlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="event-image-url"
                        value={eventImageUrl}
                        onChange={(e) => setEventImageUrl(e.target.value)}
                        className="pl-9"
                        placeholder="e.g., https://media.discordapp.net/..."
                        type="url"
                    />
                </div>
              </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                     <Button type="button" variant="outline">Cancel</Button>
                 </DialogClose>
                <Button type="submit">{submitButtonText}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}