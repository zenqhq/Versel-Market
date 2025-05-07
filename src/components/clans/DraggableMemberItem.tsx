
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { ClanMember, GameRole } from '@/app/clans/page';
import { cn } from '@/lib/utils';
import { Crown, User as UserIconLucide, GripVertical } from 'lucide-react';

interface DraggableMemberItemProps {
  member: ClanMember;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, memberId: string) => void;
  gameRoleIcons: Record<GameRole, React.ElementType>;
  className?: string;
}

const DraggableMemberItem: React.FC<DraggableMemberItemProps> = ({
  member,
  onDragStart,
  gameRoleIcons,
  className,
}) => {
  const GameRoleIcon = gameRoleIcons[member.gameRole];

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, member.id)}
      className={cn(
        "cursor-grab active:cursor-grabbing bg-card hover:bg-muted/60 transition-colors shadow-sm",
        className
      )}
      aria-label={`Drag ${member.name}`}
    >
      <CardContent className="p-2 flex items-center gap-2">
        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="character portrait small" />
          <AvatarFallback>{member.name.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{member.name}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            {member.role === 'Leader' ? (
              <Crown className="h-3 w-3 mr-1 text-yellow-500" />
            ) : (
              <UserIconLucide className="h-3 w-3 mr-1" />
            )}
            {member.role}
          </div>
        </div>
        <GameRoleIcon
          className={cn("h-4 w-4 shrink-0", {
            'text-red-500': member.gameRole === 'Melee DPS',
            'text-purple-500': member.gameRole === 'Magic DPS',
            'text-yellow-600': member.gameRole === 'Ranged DPS',
            'text-blue-500': member.gameRole === 'Tank',
            'text-green-500': member.gameRole === 'Healer',
          })}
          title={member.gameRole}
        />
      </CardContent>
    </Card>
  );
};

export default DraggableMemberItem;
