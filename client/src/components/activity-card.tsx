import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { type Activity } from "@shared/schema";
import { TagIcon } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  onToggle: (id: number) => void;
}

export function ActivityCard({ activity, onToggle }: ActivityCardProps) {
  const discountedPrice = activity.originalPrice * (1 - activity.discountPercentage / 100);
  const savings = activity.originalPrice - discountedPrice;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img 
          src={activity.imageUrl} 
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <Badge 
          className="absolute top-2 right-2 bg-red-500"
          variant="secondary"
        >
          {activity.discountPercentage}% OFF
        </Badge>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg">{activity.name}</h3>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <TagIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{activity.category}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground line-through">
            ${activity.originalPrice}
          </span>
          <span className="text-lg font-bold text-primary">
            ${discountedPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Activate</span>
          <Switch 
            checked={activity.isActive}
            onCheckedChange={() => onToggle(activity.id)}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
