

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import type { Category } from '@/lib/mock-data';
import { ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  serverName: string; // Renamed from marketplaceName
}

const CategoryFilter: FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  serverName, // Use server name
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 h-full">
      <h3 className="text-lg font-semibold mb-2 flex items-center sticky top-0 bg-card py-2 z-10 border-b -mx-4 px-4">
        <ListFilter className="mr-2 h-5 w-5 text-primary" />
        Categories
        {/* Optional: Display Server Name in Sidebar */}
        {/* <span className="text-sm text-muted-foreground ml-2">in {serverName}</span> */}
      </h3>
      {categories.map((category) => (
        <Button
          key={`${serverName}-${category.id}`} // Ensure unique key across servers, renamed from marketplaceName
          variant={selectedCategory === category.id ? 'default' : 'ghost'} // Use ghost for non-selected
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'w-full justify-start text-left transition-all duration-150 ease-in-out',
            selectedCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90' // Keep selected style strong
              : 'text-foreground hover:bg-accent hover:text-accent-foreground' // Standard hover for others
          )}
          aria-pressed={selectedCategory === category.id}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
