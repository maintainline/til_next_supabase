'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sun } from 'lucide-react';

import { Theme } from '@/types/types';
import { PopoverClose } from '@radix-ui/react-popover';
import { useSetTheme, useTheme } from '@/stores/themeStore';
const THEMES: Theme[] = ['system', 'light', 'dark'];

export default function ThemeButton() {
  const currentTheme = useTheme();
  const setTheme = useSetTheme();

  return (
    <Popover>
      <PopoverTrigger>
        <div className='hover:bg-muted cursor-pointer rounded-full p-2'>
          <Sun />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        {THEMES.map(theme => (
          <PopoverClose key={`theme-button-${theme}`} asChild>
            <div
              onClick={() => setTheme(theme)}
              className='hover:bg-muted cursor-pointer p-3 rounded-sm'
            >
              {theme}
            </div>
          </PopoverClose>
        ))}
      </PopoverContent>
    </Popover>
  );
}
