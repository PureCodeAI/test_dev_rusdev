import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlocksPanelProps {
  blocks: Array<Record<string, unknown>>;
  searchQuery: string;
  activeCategory: string;
  categories: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
}

export const BlocksPanel = ({
  blocks,
  searchQuery,
  activeCategory,
  categories,
  onSearchChange,
  onCategoryChange
}: BlocksPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input
          placeholder="Поиск блоков..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
