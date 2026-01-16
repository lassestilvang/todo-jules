'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutList, Calendar, CalendarDays, Inbox, Trash2 } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import AddListForm from './add-list-form';
import { deleteList } from '@/app/actions/list';
import { Button } from './ui/button';

interface SidebarProps {
  initialLists?: { id: number; name: string; color: string; emoji: string }[];
}

const Sidebar = ({ initialLists = [] }: SidebarProps) => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Inbox', icon: Inbox },
    { href: '/today', label: 'Today', icon: Calendar },
    { href: '/next7days', label: 'Next 7 Days', icon: CalendarDays },
    { href: '/upcoming', label: 'Upcoming', icon: LayoutList },
  ];

  const handleDeleteList = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this list?')) {
        await deleteList(id);
    }
  }

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
           Daily Planner
        </h2>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
            <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground">My Lists</h3>
                <AddListForm />
            </div>

            <ul className="space-y-1">
                {initialLists.length === 0 && (
                     <div className="px-3 text-sm text-muted-foreground italic">
                        No lists yet
                    </div>
                )}
                {initialLists.map((list) => {
                    const isActive = pathname === `/lists/${list.id}`;
                    return (
                        <li key={list.id} className="group flex items-center">
                            <Link
                                href={`/lists/${list.id}`}
                                className={cn(
                                    "flex-1 flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <span className="text-base">{list.emoji}</span>
                                <span className="truncate">{list.name}</span>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDeleteList(e, list.id)}
                                aria-label={`Delete list ${list.name}`}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </li>
                    )
                })}
            </ul>
        </div>
      </nav>

      <div className="p-4 border-t">
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
