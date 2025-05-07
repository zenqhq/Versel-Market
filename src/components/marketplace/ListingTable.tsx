'use client';

import type { FC } from 'react';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/lib/mock-data';
import { ArrowUpDown, DollarSign, CalendarDays, Activity, Tag, FileText, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; // Import ScrollArea and ScrollBar

interface ListingTableProps {
  listings: Listing[];
}

type SortKey = keyof Listing | null;
type SortDirection = 'asc' | 'desc';

const ListingTable: FC<ListingTableProps> = ({ listings }) => {
  const [sortKey, setSortKey] = useState<SortKey>('relevance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedListings = useMemo(() => {
    if (!sortKey) return listings;

    return [...listings].sort((a, b) => {
      // Handle cases where sortKey might not exist on an object (shouldn't happen with Listing type but good practice)
      const aValue = a[sortKey as keyof Listing];
      const bValue = b[sortKey as keyof Listing];

      // Provide default values or handle null/undefined if necessary
      const safeAValue = aValue ?? (typeof aValue === 'number' ? 0 : '');
      const safeBValue = bValue ?? (typeof bValue === 'number' ? 0 : '');


      if (safeAValue < safeBValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (safeAValue > safeBValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [listings, sortKey, sortDirection]);


  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" aria-label="sorted ascending" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 text-primary" aria-label="sorted descending" />
    );
  };

  const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  const formatDate = (date: Date) => {
    return format(date, 'PP'); // Use a more standard date format like 'PP' (e.g., Jul 27, 2024)
  }

  const columnHeaders: { key: SortKey; label: string; icon: React.ElementType, className?: string, isNumeric?: boolean }[] = [
    { key: null, label: 'Image', icon: FileText, className: "w-[100px]"},
    { key: 'name', label: 'Name', icon: Tag, className: "min-w-[200px] w-[30%]" }, // Ensure name column has enough min-width
    { key: 'category', label: 'Category', icon: ListFilter, className: "w-[15%]" },
    { key: 'price', label: 'Price', icon: DollarSign, className: "w-[15%]", isNumeric: true },
    { key: 'dateAdded', label: 'Date Added', icon: CalendarDays, className: "w-[15%]" },
    { key: 'relevance', label: 'Relevance', icon: Activity, className: "w-[10%]", isNumeric: true }, // Reduced width for relevance
  ];

  return (
    // Use ScrollArea to manage scrolling within the table container
    <ScrollArea className="h-full w-full">
      <Table className="min-w-full caption-bottom">
        <TableHeader className="sticky top-0 bg-background shadow-sm z-10">
          <TableRow>
            {columnHeaders.map(({ key, label, icon: Icon, className, isNumeric }) => (
              <TableHead key={label} className={cn("whitespace-nowrap p-2", isNumeric && "text-right", className)}>
                {key ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(key)}
                    className={cn("px-2 py-1 h-auto text-left font-semibold hover:bg-accent group w-full", isNumeric && "justify-end")}
                    aria-label={`Sort by ${label}`}
                  >
                     <div className={cn("flex items-center", isNumeric && "flex-row-reverse")}>
                       <Icon className={cn("h-4 w-4 group-hover:text-primary transition-colors", isNumeric ? 'ml-2' : 'mr-2')} />
                       {label}
                       {renderSortIcon(key)}
                    </div>
                  </Button>
                ) : (
                   <div className="flex items-center px-2 py-1 font-semibold text-muted-foreground">
                     <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedListings.length > 0 ? (
            sortedListings.map((listing) => (
              <TableRow key={listing.id} className="hover:bg-muted/50 transition-colors duration-150">
                <TableCell className="p-2 align-middle">
                   <Image
                      src={listing.imageUrl}
                      alt={listing.name}
                      width={80}
                      height={60}
                      className="rounded-md object-cover aspect-[4/3]" // Maintain aspect ratio
                      data-ai-hint={`${listing.category} item`} // AI hint for image search
                      unoptimized // Useful for picsum in dev, remove if using optimized images
                    />
                </TableCell>
                <TableCell className="font-medium p-2 align-middle">{listing.name}</TableCell>
                <TableCell className="p-2 align-middle text-muted-foreground">{listing.category}</TableCell>
                <TableCell className="text-right p-2 align-middle">{formatCurrency(listing.price)}</TableCell>
                <TableCell className="p-2 align-middle text-muted-foreground">{formatDate(listing.dateAdded)}</TableCell>
                <TableCell className="text-right p-2 align-middle text-muted-foreground">{listing.relevance}</TableCell>
              </TableRow>
            ))
           ) : (
            <TableRow>
                <TableCell colSpan={columnHeaders.length} className="h-24 text-center text-muted-foreground">
                    No listings found.
                </TableCell>
            </TableRow>
           )}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" /> {/* Add horizontal scrollbar */}
      <ScrollBar orientation="vertical" /> {/* Ensure vertical scrollbar is also present */}
    </ScrollArea>
  );
};


export default ListingTable;
