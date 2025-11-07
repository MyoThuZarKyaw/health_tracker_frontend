import { useState, useEffect } from "react";
import { activitiesAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "workout" | "meal" | "steps";
  activity?: any;
  onSuccess?: () => void;
}

const ActivityDialog = ({
  open,
  onOpenChange,
  type,
  activity,
  onSuccess,
}: ActivityDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split("T")[0],
    status: "planned",
    description: "",
  });
  const [workoutChoices, setWorkoutChoices] = useState<any>(null);
  const [mealChoices, setMealChoices] = useState<any>(null);
  const [stepsChoices, setStepsChoices] = useState<any>(null);

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const [workout, meal, steps] = await Promise.all([
          activitiesAPI.getWorkoutChoices(),
          activitiesAPI.getMealChoices(),
          activitiesAPI.getStepsChoices(),
        ]);
        setWorkoutChoices(workout.data);
        setMealChoices(meal.data);
        setStepsChoices(steps.data);
      } catch (error) {
        console.error("Failed to fetch choices:", error);
      }
    };
    fetchChoices();
  }, []);

  useEffect(() => {
    const choicesReady = workoutChoices && mealChoices && stepsChoices;

    if (!choicesReady) return;

    if (activity) {
      setFormData(activity);
      return;
    }

    // type-specific defaults
    let defaults: any = {
      date: new Date().toISOString().split("T")[0],
      description: "",
    };

    switch (type) {
      case "workout":
        defaults = {
          ...defaults,
          status: "planned",
          workout_type: workoutChoices?.workout_types?.[0]?.value || "cardio", // ✅ default stored here
        };
        break;

      case "meal":
        defaults = {
          ...defaults,
          status: "planned",
          meal_type: mealChoices?.meal_types?.[0]?.value || "breakfast",
        };
        break;

      case "steps":
        defaults = {
          ...defaults,
          status: "in_progress",
          total_steps: 0,
        };
        break;
    }

    setFormData(defaults);
  }, [activity, type, workoutChoices, mealChoices, stepsChoices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activity) {
        // Update existing
        if (type === "workout") {
          await activitiesAPI.updateWorkout(activity.id, formData);
        } else if (type === "meal") {
          await activitiesAPI.updateMeal(activity.id, formData);
        } else {
          await activitiesAPI.updateSteps(activity.id, formData);
        }
        toast({
          title: "Updated!",
          description: `${type} updated successfully`,
        });
      } else {
        // Create new
        if (type === "workout") {
          await activitiesAPI.createWorkout(formData);
        } else if (type === "meal") {
          await activitiesAPI.createMeal(formData);
        } else {
          await activitiesAPI.createSteps(formData);
        }
        toast({
          title: "Created!",
          description: `${type} logged successfully`,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || `Failed to save ${type}`;
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (type === "workout") {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="workout_type">Workout Type</Label>
            <Select
              value={formData.workout_type || "cardio"}
              onValueChange={(value) =>
                setFormData({ ...formData, workout_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {workoutChoices?.workout_types?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories_burned">Calories</Label>
              <Input
                id="calories_burned"
                type="number"
                value={formData.calories_burned || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calories_burned: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>
        </>
      );
    }

    if (type === "meal") {
      return (
        <>
          <div className="space-y-2">
            <Label htmlFor="meal_type">Meal Type</Label>
            <Select
              value={formData.meal_type || "breakfast"}
              onValueChange={(value) =>
                setFormData({ ...formData, meal_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {mealChoices?.meal_types?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="food_name">Food Name</Label>
            <Input
              id="food_name"
              value={formData.food_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, food_name: e.target.value })
              }
              placeholder="e.g., Oatmeal with fruits"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              value={formData.calories || ""}
              onChange={(e) =>
                setFormData({ ...formData, calories: parseInt(e.target.value) })
              }
              required
            />
          </div>
        </>
      );
    }

    if (type === "steps") {
      return (
        <div className="space-y-2">
          <Label htmlFor="total_steps">Total Steps</Label>
          <Input
            id="total_steps"
            type="number"
            value={formData.total_steps || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                total_steps: parseInt(e.target.value),
              })
            }
            placeholder="e.g., 10000"
            required
          />
        </div>
      );
    }
  };

  const getStatusOptions = () => {
    if (type === "meal") {
      return mealChoices?.meal_statuses || [];
    }
    if (type === "steps") {
      return stepsChoices?.steps_statuses || [];
    }
    return workoutChoices?.workout_statuses || [];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Edit" : "Log"}{" "}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            {activity ? "Update" : "Add"} your {type} details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          {renderFields()}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getStatusOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : activity ? "Update" : "Log Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDialog;
