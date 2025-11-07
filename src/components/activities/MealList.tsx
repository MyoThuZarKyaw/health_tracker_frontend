import { useState, useEffect } from 'react';
import { activitiesAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ActivityDialog from './ActivityDialog';

interface Meal {
  id: number;
  date: string;
  meal_type: string;
  food_name: string;
  calories: number;
  status: string;
  description: string;
}

const MealList = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const response = await activitiesAPI.getMeals();
      setMeals(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load meals",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await activitiesAPI.deleteMeal(id);
      setMeals(meals.filter(m => m.id !== id));
      toast({
        title: "Deleted",
        description: "Meal removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete meal",
      });
    }
  };

  const handleUpdateStatus = async (meal: Meal, newStatus: string) => {
    try {
      await activitiesAPI.updateMeal(meal.id, { ...meal, status: newStatus });
      loadMeals();
      toast({
        title: "Updated",
        description: "Meal status updated",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading meals...</div>;
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-2">No meals logged yet</p>
        <p className="text-sm">Click "Log Activity" to add your first meal</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-card transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold capitalize">{meal.meal_type}</h3>
                <Badge
                  variant={meal.status === 'consumed' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleUpdateStatus(meal, meal.status === 'consumed' ? 'planned' : 'consumed')}
                >
                  {meal.status}
                </Badge>
              </div>
              <p className="font-medium mb-1">{meal.food_name}</p>
              <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  {meal.calories} cal
                </span>
                <span className="text-muted-foreground">{new Date(meal.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMeal(meal)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(meal.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editMeal && (
        <ActivityDialog
          open={!!editMeal}
          onOpenChange={(open) => !open && setEditMeal(null)}
          type="meal"
          activity={editMeal}
          onSuccess={() => {
            setEditMeal(null);
            loadMeals();
          }}
        />
      )}
    </>
  );
};

export default MealList;
