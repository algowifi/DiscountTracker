import { type Activity } from "@shared/schema";
import { ActivityCard } from "./activity-card";

interface ActivityGridProps {
  activities: Activity[];
  onToggle: (id: number) => void;
}

export function ActivityGrid({ activities, onToggle }: ActivityGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
