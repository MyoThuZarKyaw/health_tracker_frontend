import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { activitiesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, LogOut, Plus, Dumbbell, Apple, Footprints } from 'lucide-react';
import WorkoutList from '@/components/activities/WorkoutList';
import MealList from '@/components/activities/MealList';
import StepsList from '@/components/activities/StepsList';
import ActivityDialog from '@/components/activities/ActivityDialog';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('workouts');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [stats, setStats] = useState({
    workouts: 0,
    meals: 0,
    steps: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadStats();
  }, [user, navigate, refreshKey]);

  const loadStats = async () => {
    try {
      const [workoutsRes, mealsRes, stepsRes] = await Promise.all([
        activitiesAPI.getWorkouts(),
        activitiesAPI.getMeals(),
        activitiesAPI.getSteps(),
      ]);
      
      setStats({
        workouts: workoutsRes.data.length || 0,
        meals: mealsRes.data.length || 0,
        steps: stepsRes.data.length || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleActivityCreated = () => {
    setIsDialogOpen(false);
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Success!",
      description: "Activity logged successfully.",
    });
  };

  const getDialogType = () => {
    switch (activeTab) {
      case 'meals':
        return 'meal';
      case 'steps':
        return 'steps';
      default:
        return 'workout';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-full">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Health Tracker</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user?.full_name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Workouts</CardTitle>
              <Dumbbell className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.workouts}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Meals</CardTitle>
              <Apple className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.meals}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Steps Logged</CardTitle>
              <Footprints className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.steps}</div>
            </CardContent>
          </Card>
        </div>

        {/* Activities */}
        <Card className="shadow-card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Track and manage your daily activities</CardDescription>
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="workouts">Workouts</TabsTrigger>
                <TabsTrigger value="meals">Meals</TabsTrigger>
                <TabsTrigger value="steps">Steps</TabsTrigger>
              </TabsList>
              
              <TabsContent value="workouts" className="mt-6">
                <WorkoutList key={refreshKey} />
              </TabsContent>
              
              <TabsContent value="meals" className="mt-6">
                <MealList key={refreshKey} />
              </TabsContent>
              
              <TabsContent value="steps" className="mt-6">
                <StepsList key={refreshKey} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ActivityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        type={getDialogType()}
        onSuccess={handleActivityCreated}
      />
    </div>
  );
};

export default Dashboard;
