
'use client';

import { icons, type LucideProps } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '../ui/input';

const curatedIcons = [
  'Sprout', 'Brain', 'Code', 'Palette', 'Music', 'Dumbbell', 'Camera', 'BookOpen', 
  'PenTool', 'Target', 'Telescope', 'FlaskConical', 'Heart', 'Briefcase', 'MessageCircle', 
  'Globe', 'Wrench', 'Mic', 'Film', 'Database', 'Cloud', 'Terminal', 'GitGraph', 'Feather',
  'Keyboard', 'MousePointer', 'Paintbrush', 'Scaling', 'Medal', 'Rocket'
] as (keyof typeof icons)[];

const allIconNames = Object.keys(icons) as (keyof typeof icons)[];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const LucideIcon = icons[value as keyof typeof icons] || icons['Sprout'];

  const filteredIcons = search
    ? allIconNames.filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    : curatedIcons;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-12 w-12 p-0', className)}
        >
          <LucideIcon className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="p-2">
          <Input
            placeholder="Search all icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="grid h-64 grid-cols-6 gap-2 overflow-y-auto p-2">
          {filteredIcons.map((iconName) => {
            const Icon = icons[iconName as keyof typeof icons];
            return (
              <Button
                key={iconName}
                variant="ghost"
                size="icon"
                onClick={() => {
                  onChange(iconName);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={cn(
                  'h-10 w-10 rounded-md',
                  value === iconName && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="size-5" />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const colorPalette = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
  '#ff5722', '#795548', '#607d8b'
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('h-12 w-12 p-0', className)}
                >
                    <div className="h-6 w-6 rounded-md" style={{ backgroundColor: value }} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                 <div className="grid grid-cols-6 gap-2">
                    {colorPalette.map(color => (
                        <button
                            key={color}
                            onClick={() => {
                                onChange(color);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'h-8 w-8 rounded-md transition-transform hover:scale-110',
                                value === color && 'ring-2 ring-ring ring-offset-2 ring-offset-background'
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                 </div>
            </PopoverContent>
        </Popover>
    )

}
