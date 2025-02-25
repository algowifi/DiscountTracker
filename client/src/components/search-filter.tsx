import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@shared/schema";
import { SearchIcon } from "lucide-react";

interface SearchFilterProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function SearchFilter({ 
  search, 
  category, 
  onSearchChange, 
  onCategoryChange 
}: SearchFilterProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search activities..."
          className="pl-10"
        />
      </div>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}