'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Quest } from '@/lib/types';

interface DraggableQuestItemProps {
  quest: Quest;
  onTextChange: (id: string, field: 'text', value: string) => void;
  onCompletedChange: (id: string, field: 'completed', value: boolean) => void;
  onDelete: (id: string) => void;
  onBlur: () => void;
}

export function DraggableQuestItem({ quest, onTextChange, onCompletedChange, onDelete, onBlur }: DraggableQuestItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: quest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 group',
        isDragging && 'bg-card shadow-lg rounded-md'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="size-5" />
      </button>
      <Checkbox
        id={`quest-check-${quest.id}`}
        checked={quest.completed}
        onCheckedChange={(checked) => onCompletedChange(quest.id, 'completed', !!checked)}
        className="size-5"
      />
      <Input
        value={quest.text}
        onChange={(e) => onTextChange(quest.id, 'text', e.target.value)}
        onBlur={onBlur}
        placeholder="Define your quest..."
        className={cn(
          'flex-grow',
          quest.completed && 'text-muted-foreground line-through'
        )}
      />
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 opacity-0 group-hover:opacity-100"
        onClick={() => onDelete(quest.id)}
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

    