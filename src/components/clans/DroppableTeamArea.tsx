'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClanMember, GameRole } from '@/app/clans/page';
import DraggableMemberItem from './DraggableMemberItem';
import { Users, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface TeamSlotProp {
  id: string;
  name: string;
}
interface DroppableTeamAreaProps {
  teamSlot: TeamSlotProp;
  assignedMemberIds: string[];
  allClanMembers?: ClanMember[];
  onDrop: (event: React.DragEvent<HTMLDivElement>, teamId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onMemberDragStart: (event: React.DragEvent<HTMLDivElement>, memberId: string, sourceTeamId: string) => void;
  gameRoleIcons: Record<GameRole, React.ElementType>;
  getMemberById: (memberId: string) => ClanMember | undefined;
  draggedMemberId: string | null;
  onDeleteTeam: (teamId: string) => void;
}

const DroppableTeamArea: React.FC<DroppableTeamAreaProps> = ({
  teamSlot,
  assignedMemberIds,
  onDrop,
  onDragOver,
  onMemberDragStart,
  gameRoleIcons,
  getMemberById,
  draggedMemberId,
  onDeleteTeam,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = () => setIsDragOver(true);
  const handleDragLeave = () => setIsDragOver(false);
  const handleDropInternal = (event: React.DragEvent<HTMLDivElement>) => {
    onDrop(event, teamSlot.id);
    setIsDragOver(false);
  };


  return (
    <Card
      onDrop={handleDropInternal}
      onDragOver={onDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn("flex flex-col h-full", isDragOver && "ring-2 ring-primary ring-offset-2 bg-accent")}
    >
      <CardHeader className="py-3 px-4 border-b bg-muted/30 flex items-center justify-between">
        {/* Combined Left group: Icon, Name, Member Count, Delete Button */}
        <div className="flex items-center gap-1.5">
          <Users className="h-5 w-5 text-muted-foreground"/>
          <span className="text-md font-semibold">{teamSlot.name}</span>
          <span className="text-md font-semibold text-muted-foreground ml-1">({assignedMemberIds.length})</span>
          <Button
              variant="ghost"
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDeleteTeam(teamSlot.id)}
              aria-label={`Delete team ${teamSlot.name}`}
          >
              <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <CardContent className="p-3 space-y-2 min-h-[100px]">
          {assignedMemberIds.length === 0 && !isDragOver && (
            <p className="text-sm text-muted-foreground text-center py-4">Drag members here</p>
          )}
          {isDragOver && assignedMemberIds.length === 0 && (
             <p className="text-sm text-primary font-semibold text-center py-4">Drop to add member</p>
          )}
          {assignedMemberIds.map(memberId => {
            const member = getMemberById(memberId);
            if (!member) return null;
            return (
              <DraggableMemberItem
                key={member.id}
                member={member}
                onDragStart={(e, id) => onMemberDragStart(e, id, teamSlot.id)}
                gameRoleIcons={gameRoleIcons}
                className={cn(draggedMemberId === member.id && "opacity-50 ring-2 ring-primary")}
              />
            );
          })}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default DroppableTeamArea;
