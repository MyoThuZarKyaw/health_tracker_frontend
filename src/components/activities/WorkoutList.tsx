import { useState, useEffect } from 'react';
import { activitiesAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, Flame } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ActivityDialog from './ActivityDialog';

interface Workout {
  id: number;
  date: string;
  workout_type: string;
  duration: number;
  calories_burned: number;
  status: string;
  description: string;
}

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const response = await activitiesAPI.getWorkouts();
      setWorkouts(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load workouts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await activitiesAPI.deleteWorkout(id);
      setWorkouts(workouts.filter(w => w.id !== id));
      toast({
        title: "Deleted",
        description: "Workout removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete workout",
      });
    }
  };

  const handleUpdateStatus = async (workout: Workout, newStatus: string) => {
    try {
      await activitiesAPI.updateWorkout(workout.id, { ...workout, status: newStatus });
      loadWorkouts();
      toast({
        title: "Updated",
        description: "Workout status updated",
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
    return <div className="text-center py-8 text-muted-foreground">Loading workouts...</div>;
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-2">No workouts logged yet</p>
        <p className="text-sm">Click "Log Activity" to add your first workout</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-card transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold capitalize">{workout.workout_type}</h3>
                <Badge
                  variant={workout.status === 'completed' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleUpdateStatus(workout, workout.status === 'completed' ? 'planned' : 'completed')}
                >
                  {workout.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{workout.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {workout.duration} min
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  {workout.calories_burned} cal
                </span>
                <span className="text-muted-foreground">{new Date(workout.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditWorkout(workout)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(workout.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editWorkout && (
        <ActivityDialog
          open={!!editWorkout}
          onOpenChange={(open) => !open && setEditWorkout(null)}
          type="workout"
          activity={editWorkout}
          onSuccess={() => {
            setEditWorkout(null);
            loadWorkouts();
          }}
        />
      )}
    </>
  );
};

export default WorkoutList;
