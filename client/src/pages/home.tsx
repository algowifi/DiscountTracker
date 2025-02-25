import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Activity } from "@shared/schema";
import { ActivityGrid } from "@/components/activity-grid";
import { SearchFilter } from "@/components/search-filter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/activities/${id}/toggle`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Success",
        description: "Discount status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update discount status",
        variant: "destructive",
      });
    },
  });

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = category === "all" || !category || activity.category === category;
    return matchesSearch && matchesCategory;
  });

  const totalSavings = filteredActivities
    .filter((a) => a.isActive)
    .reduce((sum, activity) => {
      const discount = activity.originalPrice * (activity.discountPercentage / 100);
      return sum + discount;
    }, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/3 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-sm sm:text-base font-medium">
                Benvenuto, <span className="text-primary">{user?.username}</span>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-muted-foreground hover:text-foreground"
            >
              {logoutMutation.isPending ? (
                "Disconnessione..."
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Activity Discounts
            </h1>
            {totalSavings > 0 && (
              <p className="text-base sm:text-lg text-muted-foreground mt-2">
                Total potential savings: ${totalSavings.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <SearchFilter
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        <ActivityGrid
          activities={filteredActivities}
          onToggle={(id) => toggleMutation.mutate(id)}
        />
      </div>
    </div>
  );
}