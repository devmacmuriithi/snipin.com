import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  CheckCircle, 
  Clock, 
  Book, 
  StickyNote, 
  Plus,
  Lightbulb,
  Database,
  Activity,
  Check,
  X,
  TrendingUp,
  BarChart3,
  Settings,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface MemPodItem {
  id: number;
  type: 'capture' | 'task' | 'note' | 'goal' | 'knowledge';
  title: string;
  content: string;
  status?: 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  progress?: number;
  tags?: string[];
  createdAt: string;
}

export default function MemPod() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("capture");
  const [captureContent, setCaptureContent] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [knowledgeInput, setKnowledgeInput] = useState("");

  const { data: mempodItems = [] } = useQuery({
    queryKey: ["/api/mempod"],
    enabled: !!user,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/mempod", data);
    },
    onSuccess: () => {
      toast({
        title: "Item Created",
        description: "Your item has been added to MemPod.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mempod"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      await apiRequest("PATCH", `/api/mempod/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mempod"] });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const handleProcessCapture = () => {
    if (!captureContent.trim()) {
      toast({
        title: "Missing Content",
        description: "Please enter some content to process.",
        variant: "destructive",
      });
      return;
    }

    createItemMutation.mutate({
      type: 'capture',
      content: captureContent,
      title: captureContent.substring(0, 50) + (captureContent.length > 50 ? '...' : ''),
    });
    setCaptureContent("");
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    
    createItemMutation.mutate({
      type: 'task',
      title: taskInput,
      content: taskInput,
      status: 'pending',
      priority: 'medium',
    });
    setTaskInput("");
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    
    createItemMutation.mutate({
      type: 'note',
      title: noteInput,
      content: noteInput,
    });
    setNoteInput("");
  };

  const handleAddGoal = () => {
    if (!goalInput.trim()) return;
    
    createItemMutation.mutate({
      type: 'goal',
      title: goalInput,
      content: goalInput,
      progress: 0,
    });
    setGoalInput("");
  };

  const handleAddKnowledge = () => {
    if (!knowledgeInput.trim()) return;
    
    createItemMutation.mutate({
      type: 'knowledge',
      title: knowledgeInput,
      content: knowledgeInput,
    });
    setKnowledgeInput("");
  };

  const toggleTaskComplete = (item: MemPodItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    updateItemMutation.mutate({
      id: item.id,
      updates: { status: newStatus }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'capture': return <Brain className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'note': return <StickyNote className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'knowledge': return <Database className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  // Goal Card Component with metrics tracking
  const GoalCard = ({ goal }: { goal: MemPodItem }) => {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [showMetrics, setShowMetrics] = useState(false);
    const [newMetric, setNewMetric] = useState({ name: '', targetValue: '', unit: 'count' });
    const [progressUpdate, setProgressUpdate] = useState({ metricId: '', value: '', note: '' });

    const { data: goalMetrics = [] } = useQuery({
      queryKey: [`/api/goals/${goal.id}/metrics`],
      enabled: !!goal.id && showMetrics,
    });

    const createMetricMutation = useMutation({
      mutationFn: async (data: any) => {
        await apiRequest("POST", `/api/goals/${goal.id}/metrics`, data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/goals/${goal.id}/metrics`] });
        setNewMetric({ name: '', targetValue: '', unit: 'count' });
        toast({ title: "Metric Added", description: "New metric added to goal." });
      },
      onError: (error) => {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => window.location.href = "/api/login", 500);
          return;
        }
        toast({ title: "Error", description: "Failed to add metric.", variant: "destructive" });
      },
    });

    const addProgressMutation = useMutation({
      mutationFn: async ({ metricId, value, note }: any) => {
        await apiRequest("POST", `/api/metrics/${metricId}/progress`, { value: parseInt(value), note });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/goals/${goal.id}/metrics`] });
        queryClient.invalidateQueries({ queryKey: ["/api/mempod"] });
        setProgressUpdate({ metricId: '', value: '', note: '' });
        toast({ title: "Progress Updated", description: "Goal progress has been recorded." });
      },
      onError: (error) => {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => window.location.href = "/api/login", 500);
          return;
        }
        toast({ title: "Error", description: "Failed to update progress.", variant: "destructive" });
      },
    });

    const handleAddMetric = () => {
      if (!newMetric.name.trim() || !newMetric.targetValue) return;
      createMetricMutation.mutate({
        name: newMetric.name,
        targetValue: parseInt(newMetric.targetValue),
        unit: newMetric.unit,
      });
    };

    const handleUpdateProgress = () => {
      if (!progressUpdate.metricId || !progressUpdate.value) return;
      addProgressMutation.mutate(progressUpdate);
    };

    return (
      <div className="p-4 bg-white rounded-lg border">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{goal.content}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-600">{goal.progress || 0}%</span>
          </div>
        </div>
        
        <Progress value={goal.progress || 0} className="h-3 mb-3" />
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showMetrics ? 'Hide Metrics' : 'Manage Metrics'}
          </Button>
          
          <div className="text-xs text-gray-500">
            Created {new Date(goal.createdAt).toLocaleDateString()}
          </div>
        </div>

        {showMetrics && (
          <div className="mt-4 pt-4 border-t">
            {/* Metrics List */}
            <div className="space-y-3 mb-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goal Metrics
              </h4>
              
              {goalMetrics.map((metric: any) => (
                <div key={metric.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-sm text-gray-600">
                      {metric.currentValue}/{metric.targetValue} {metric.unit}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (metric.currentValue / metric.targetValue) * 100)} 
                    className="h-2 mb-2" 
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Update ${metric.unit}`}
                      value={progressUpdate.metricId === metric.id.toString() ? progressUpdate.value : ''}
                      onChange={(e) => setProgressUpdate({ 
                        ...progressUpdate, 
                        metricId: metric.id.toString(), 
                        value: e.target.value 
                      })}
                      className="flex-1"
                      type="number"
                    />
                    <Input
                      placeholder="Note (optional)"
                      value={progressUpdate.metricId === metric.id.toString() ? progressUpdate.note : ''}
                      onChange={(e) => setProgressUpdate({ 
                        ...progressUpdate, 
                        note: e.target.value 
                      })}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUpdateProgress}
                      disabled={addProgressMutation.isPending || progressUpdate.metricId !== metric.id.toString() || !progressUpdate.value}
                      size="sm"
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Metric */}
            <div className="p-3 bg-blue-50 rounded border">
              <h5 className="font-medium text-sm mb-3">Add New Metric</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <Input
                  placeholder="Metric name"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                />
                <Input
                  placeholder="Target value"
                  type="number"
                  value={newMetric.targetValue}
                  onChange={(e) => setNewMetric({ ...newMetric, targetValue: e.target.value })}
                />
                <Select
                  value={newMetric.unit}
                  onValueChange={(value) => setNewMetric({ ...newMetric, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="lbs">Pounds</SelectItem>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="km">Kilometers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddMetric}
                disabled={createMetricMutation.isPending || !newMetric.name.trim() || !newMetric.targetValue}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading MemPod...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tasks = mempodItems.filter((item: MemPodItem) => item.type === 'task');
  const notes = mempodItems.filter((item: MemPodItem) => item.type === 'note');
  const goals = mempodItems.filter((item: MemPodItem) => item.type === 'goal');
  const knowledge = mempodItems.filter((item: MemPodItem) => item.type === 'knowledge');
  const recentActivity = mempodItems.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <NavigationSidebar />
      
      <div className="ml-72 p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header */}
            <GlassCard className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-extrabold gradient-text mb-2 flex items-center gap-3">
                    <Brain className="h-8 w-8" />
                    MemPod
                  </h1>
                  <p className="text-slate-600 text-lg">Personal Intelligence Watchtower</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{mempodItems.length}</div>
                  <div className="text-sm text-slate-500 font-semibold">Total Items</div>
                </div>
              </div>
            </GlassCard>

            {/* Quick Capture Interface */}
            <GlassCard className="overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <h2 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Quick Capture
                </h2>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="capture" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Thought
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goals
                    </TabsTrigger>
                    <TabsTrigger value="knowledge" className="flex items-center gap-2">
                      <Book className="h-4 w-4" />
                      Knowledge
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="capture" className="p-6">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Capture thoughts, insights, ideas, decisions, learnings, or any intelligence for your AI agent..."
                        value={captureContent}
                        onChange={(e) => setCaptureContent(e.target.value)}
                        className="min-h-32 resize-none"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleProcessCapture}
                          disabled={createItemMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          {createItemMutation.isPending ? "Processing..." : "Process"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tasks" className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a new task..."
                          value={taskInput}
                          onChange={(e) => setTaskInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                        <Button onClick={handleAddTask} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {tasks.map((task: MemPodItem) => (
                          <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <button
                              onClick={() => toggleTaskComplete(task)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                task.status === 'completed' 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : 'border-gray-300 hover:border-blue-500'
                              }`}
                            >
                              {task.status === 'completed' && <Check className="h-3 w-3" />}
                            </button>
                            <span className={`flex-1 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority || 'medium')}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a quick note..."
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                        />
                        <Button onClick={handleAddNote} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {notes.map((note: MemPodItem) => (
                          <div key={note.id} className="p-4 bg-white rounded-lg border">
                            <div className="text-sm text-gray-800 mb-2">{note.content}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a new goal..."
                          value={goalInput}
                          onChange={(e) => setGoalInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                        />
                        <Button onClick={handleAddGoal} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {goals.map((goal: MemPodItem) => (
                          <GoalCard key={goal.id} goal={goal} />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="knowledge" className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add knowledge item..."
                          value={knowledgeInput}
                          onChange={(e) => setKnowledgeInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddKnowledge()}
                        />
                        <Button onClick={handleAddKnowledge} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {knowledge.map((item: MemPodItem) => (
                          <div key={item.id} className="p-4 bg-white rounded-lg border border-l-4 border-l-blue-500">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold">{item.title}</span>
                              <Badge variant="secondary">Knowledge</Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{item.content}</div>
                            <div className="text-xs text-gray-500">
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </GlassCard>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Life Overview */}
            <GlassCard>
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Life Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-4 text-center border">
                    <div className="text-xl font-bold gradient-text">{tasks.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Tasks</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border">
                    <div className="text-xl font-bold gradient-text">{goals.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Goals</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border">
                    <div className="text-xl font-bold gradient-text">{notes.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Notes</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center border">
                    <div className="text-xl font-bold gradient-text">{knowledge.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Knowledge</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </h3>
                  <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
                    View All
                  </span>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((item: MemPodItem) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800 truncate">{item.title}</div>
                        <div className="text-xs text-gray-500 flex justify-between items-center">
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}