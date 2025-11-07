import { useState, useEffect } from 'react';
import { activitiesAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Footprints } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ActivityDialog from './ActivityDialog';

interface Steps {
  id: number;
  date: string;
  total_steps: number;
  status: string;
  description: string;
}

const StepsList = () => {
  const [steps, setSteps] = useState<Steps[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSteps, setEditSteps] = useState<Steps | null>(null);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      const response = await activitiesAPI.getSteps();
      setSteps(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load steps",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await activitiesAPI.deleteSteps(id);
      setSteps(steps.filter(s => s.id !== id));
      toast({
        title: "Deleted",
        description: "Steps entry removed successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete steps",
      });
    }
  };

  const handleUpdateStatus = async (stepsEntry: Steps, newStatus: string) => {
    try {
      await activitiesAPI.updateSteps(stepsEntry.id, { ...stepsEntry, status: newStatus });
      loadSteps();
      toast({
        title: "Updated",
        description: "Steps status updated",
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
    return <div className="text-center py-8 text-muted-foreground">Loading steps...</div>;
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="mb-2">No steps logged yet</p>
        <p className="text-sm">Click "Log Activity" to add your first steps entry</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-card transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">Daily Steps</h3>
                <Badge
                  variant={step.status === 'completed' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleUpdateStatus(step, step.status === 'completed' ? 'in_progress' : 'completed')}
                >
                  {step.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-accent font-semibold">
                  <Footprints className="w-4 h-4" />
                  {step.total_steps.toLocaleString()} steps
                </span>
                <span className="text-muted-foreground">{new Date(step.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditSteps(step)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(step.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editSteps && (
        <ActivityDialog
          open={!!editSteps}
          onOpenChange={(open) => !open && setEditSteps(null)}
          type="steps"
          activity={editSteps}
          onSuccess={() => {
            setEditSteps(null);
            loadSteps();
          }}
        />
      )}
    </>
  );
};

export default StepsList;
