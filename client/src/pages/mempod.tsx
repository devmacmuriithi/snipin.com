import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Target, 
  Calendar, 
  Book, 
  Star, 
  Plus, 
  Edit2, 
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  Mic,
  Camera,
  FileText,
  Lightbulb,
  Users,
  Activity
} from "lucide-react";

interface MemPodItem {
  id: number;
  userId: string;
  type: 'capture' | 'note' | 'task' | 'goal' | 'knowledge';
  title: string;
  content: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  status?: 'active' | 'completed' | 'paused';
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export default function MemPod() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [quickCapture, setQuickCapture] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newNote, setNewNote] = useState('');

  const { data: memPodItems = [] } = useQuery<MemPodItem[]>({
    queryKey: ["/api/mempod"],
    enabled: !!user,
  });

  const createItemMutation = useMutation({
    mutationFn: async (item: Partial<MemPodItem>) => {
      return await apiRequest("/api/mempod", "POST", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mempod"] });
      toast({ title: "Item created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create item", variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<MemPodItem> }) => {
      return await apiRequest(`/api/mempod/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mempod"] });
      toast({ title: "Item updated successfully" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 flex items-center justify-center">
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

  const captures = memPodItems.filter(item => item.type === 'capture');
  const notes = memPodItems.filter(item => item.type === 'note');
  const tasks = memPodItems.filter(item => item.type === 'task');
  const goals = memPodItems.filter(item => item.type === 'goal');
  const knowledge = memPodItems.filter(item => item.type === 'knowledge');

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const activeTasks = tasks.filter(task => task.status === 'active').length;
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;

  const handleQuickCapture = async () => {
    if (!quickCapture.trim()) return;
    
    await createItemMutation.mutateAsync({
      type: 'capture',
      title: quickCapture.slice(0, 50),
      content: quickCapture,
      status: 'active'
    });
    setQuickCapture('');
  };

  const handleQuickTask = async () => {
    if (!newTask.trim()) return;
    
    await createItemMutation.mutateAsync({
      type: 'task',
      title: newTask,
      content: newTask,
      status: 'active',
      priority: 'medium'
    });
    setNewTask('');
  };

  const handleQuickNote = async () => {
    if (!newNote.trim()) return;
    
    await createItemMutation.mutateAsync({
      type: 'note',
      title: newNote.slice(0, 50),
      content: newNote,
      status: 'active'
    });
    setNewNote('');
  };

  const toggleTaskComplete = async (task: MemPodItem) => {
    const newStatus = task.status === 'completed' ? 'active' : 'completed';
    await updateItemMutation.mutateAsync({
      id: task.id,
      updates: { status: newStatus, progress: newStatus === 'completed' ? 100 : 0 }
    });
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'capture', label: 'Quick Capture', icon: Mic },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'knowledge', label: 'Knowledge', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            <div className="space-y-6">
              {/* Header */}
              <GlassCard className="p-8">
                <div className="text-center">
                  <h1 className="text-4xl font-extrabold gradient-text mb-2">MemPod</h1>
                  <p className="text-slate-600 text-lg">Personal Intelligence Watchtower</p>
                </div>
              </GlassCard>

              {/* Quick Capture */}
              <GlassCard className="p-6">
                <div className="flex items-center mb-4">
                  <Mic className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-bold text-slate-800">Quick Capture</h2>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Capture a thought, idea, or observation..."
                    value={quickCapture}
                    onChange={(e) => setQuickCapture(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickCapture()}
                    className="flex-1"
                  />
                  <Button onClick={handleQuickCapture} disabled={!quickCapture.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>

              {/* Section Navigation */}
              <GlassCard className="p-4">
                <div className="flex flex-wrap gap-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white/50 text-slate-700 hover:bg-white/70'
                        }`}
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Content Sections */}
              {activeSection === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{captures.length}</div>
                      <div className="text-sm text-slate-600">Captures</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                      <div className="text-sm text-slate-600">Tasks Done</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{notes.length}</div>
                      <div className="text-sm text-slate-600">Notes</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{completedGoals}</div>
                      <div className="text-sm text-slate-600">Goals</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {memPodItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {item.type.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-800">{item.title}</div>
                            <div className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                          </div>
                          <Badge variant="outline" className="capitalize">{item.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeSection === 'capture' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Captures</h3>
                  <div className="space-y-3">
                    {captures.map((capture) => (
                      <div key={capture.id} className="p-4 bg-white/50 rounded-lg">
                        <div className="font-medium text-slate-800 mb-1">{capture.title}</div>
                        <div className="text-slate-600 text-sm">{capture.content}</div>
                        <div className="text-xs text-slate-500 mt-2">
                          {new Date(capture.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {activeSection === 'tasks' && (
                <div className="space-y-4">
                  <GlassCard className="p-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Add a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleQuickTask()}
                        className="flex-1"
                      />
                      <Button onClick={handleQuickTask} disabled={!newTask.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tasks ({activeTasks} active)</h3>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-white/30 rounded-lg">
                          <button
                            onClick={() => toggleTaskComplete(task)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-300 hover:border-green-500'
                            }`}
                          >
                            {task.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                          </button>
                          <div className="flex-1">
                            <div className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {task.title}
                            </div>
                            {task.dueDate && (
                              <div className="text-sm text-slate-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {task.priority && (
                            <Badge className={
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {task.priority}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeSection === 'notes' && (
                <div className="space-y-4">
                  <GlassCard className="p-4">
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Write a note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        className="flex-1"
                      />
                      <Button onClick={handleQuickNote} disabled={!newNote.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Notes ({notes.length})</h3>
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <div key={note.id} className="p-4 bg-white/50 rounded-lg">
                          <div className="font-medium text-slate-800 mb-2">{note.title}</div>
                          <div className="text-slate-600 mb-3">{note.content}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(note.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeSection === 'goals' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Goals ({goals.length})</h3>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="p-4 bg-white/50 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-slate-800">{goal.title}</div>
                            <div className="text-slate-600 text-sm mt-1">{goal.content}</div>
                          </div>
                          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                            {goal.status}
                          </Badge>
                        </div>
                        {typeof goal.progress === 'number' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {activeSection === 'knowledge' && (
                <GlassCard className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Knowledge Base ({knowledge.length})</h3>
                  <div className="space-y-4">
                    {knowledge.map((item) => (
                      <div key={item.id} className="p-4 bg-white/50 rounded-lg">
                        <div className="font-medium text-slate-800 mb-2">{item.title}</div>
                        <div className="text-slate-600 mb-3">{item.content}</div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="space-y-6">
              {/* Quick Actions */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Visual Capture
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Note
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Insight
                  </Button>
                </div>
              </GlassCard>

              {/* Intelligence Metrics */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Intelligence Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Productivity Score</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Knowledge Growth</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>Goal Achievement</span>
                      <span>74%</span>
                    </div>
                    <Progress value={74} className="h-2" />
                  </div>
                </div>
              </GlassCard>

              {/* Upcoming Items */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Upcoming</h3>
                <div className="space-y-3">
                  {tasks.filter(task => task.dueDate && task.status !== 'completed').slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 text-sm">{task.title}</div>
                        <div className="text-xs text-slate-500">
                          {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}