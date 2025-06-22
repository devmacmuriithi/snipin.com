import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Filter
} from "lucide-react";

type MemPodItemType = 'memory' | 'goal' | 'knowledge' | 'favorite';

interface MemPodItem {
  id: number;
  userId: string;
  type: MemPodItemType;
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

interface GoalMetric {
  id: number;
  goalId: number;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  createdAt: string;
}

export default function MemPod() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<MemPodItemType | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MemPodItem | null>(null);

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
      setIsCreateDialogOpen(false);
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
      setEditingItem(null);
      toast({ title: "Item updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/mempod/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mempod"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete item", variant: "destructive" });
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

  const filteredItems = selectedType === 'all' 
    ? memPodItems 
    : memPodItems.filter((item) => item.type === selectedType);

  const itemCounts = {
    all: memPodItems.length,
    memory: memPodItems.filter((item: MemPodItem) => item.type === 'memory').length,
    goal: memPodItems.filter((item: MemPodItem) => item.type === 'goal').length,
    knowledge: memPodItems.filter((item: MemPodItem) => item.type === 'knowledge').length,
    favorite: memPodItems.filter((item: MemPodItem) => item.type === 'favorite').length,
  };

  const completedGoals = memPodItems.filter((item: MemPodItem) => 
    item.type === 'goal' && item.status === 'completed'
  ).length;

  const activeGoals = memPodItems.filter((item: MemPodItem) => 
    item.type === 'goal' && item.status === 'active'
  ).length;

  const getTypeIcon = (type: MemPodItemType) => {
    switch (type) {
      case 'memory': return Brain;
      case 'goal': return Target;
      case 'knowledge': return Book;
      case 'favorite': return Star;
    }
  };

  const getTypeColor = (type: MemPodItemType) => {
    switch (type) {
      case 'memory': return 'from-blue-500 to-cyan-600';
      case 'goal': return 'from-green-500 to-emerald-600';
      case 'knowledge': return 'from-purple-500 to-indigo-600';
      case 'favorite': return 'from-orange-500 to-red-600';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="space-y-6">
              {/* Header */}
              <GlassCard className="p-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-4xl font-extrabold gradient-text mb-2">MemPod</h1>
                    <p className="text-slate-600 text-lg">Your AI-powered memory and goal tracking system</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-800">{itemCounts.all}</div>
                      <div className="text-sm text-slate-500 font-semibold">Total Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
                      <div className="text-sm text-slate-500 font-semibold">Goals Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
                      <div className="text-sm text-slate-500 font-semibold">Active Goals</div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Stats & Actions */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`p-4 rounded-xl text-center transition-all ${
                    selectedType === 'all' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'bg-white/50 hover:bg-white/70 text-slate-700'
                  }`}
                >
                  <Filter className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-semibold">All Items</div>
                  <div className="text-sm opacity-80">{itemCounts.all}</div>
                </button>

                {(['memory', 'goal', 'knowledge', 'favorite'] as MemPodItemType[]).map((type) => {
                  const IconComponent = getTypeIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        selectedType === type 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/70 text-slate-700'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-semibold capitalize">{type}</div>
                      <div className="text-sm opacity-80">{itemCounts[type]}</div>
                    </button>
                  );
                })}
              </div>

              {/* Actions Bar */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    {selectedType === 'all' ? 'All Items' : `${selectedType.charAt(0).toUpperCase()}${selectedType.slice(1)}s`}
                  </h2>
                  <Badge variant="secondary">{filteredItems.length} items</Badge>
                </div>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New MemPod Item</DialogTitle>
                    </DialogHeader>
                    <CreateItemForm 
                      onSubmit={(data) => createItemMutation.mutate(data)}
                      isLoading={createItemMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Items Grid */}
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <GlassCard className="p-12">
                    <div className="text-center">
                      <Brain className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-slate-600 mb-4">
                        {selectedType === 'all' ? 'Your MemPod is Empty' : `No ${selectedType}s found`}
                      </h3>
                      <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Start adding {selectedType === 'all' ? 'memories, goals, and knowledge' : selectedType + 's'} to build your personal AI-powered system.
                      </p>
                    </div>
                  </GlassCard>
                ) : (
                  filteredItems.map((item: MemPodItem) => {
                    const IconComponent = getTypeIcon(item.type);
                    return (
                      <GlassCard key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(item.type)} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-slate-800 truncate">{item.title}</h3>
                              <div className="flex items-center space-x-2 ml-4">
                                {item.priority && (
                                  <Badge className={getPriorityColor(item.priority)}>
                                    {item.priority}
                                  </Badge>
                                )}
                                {item.status && (
                                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                                    {item.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {item.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-slate-600 mb-3 line-clamp-2">{item.content}</p>
                            
                            {item.type === 'goal' && typeof item.progress === 'number' && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm text-slate-600 mb-1">
                                  <span>Progress</span>
                                  <span>{item.progress}%</span>
                                </div>
                                <Progress value={item.progress} className="h-2" />
                              </div>
                            )}
                            
                            {item.dueDate && (
                              <div className="flex items-center text-sm text-slate-500 mb-3">
                                <Calendar className="w-4 h-4 mr-1" />
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-slate-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingItem(item)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteItemMutation.mutate(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit MemPod Item</DialogTitle>
            </DialogHeader>
            <CreateItemForm 
              initialData={editingItem}
              onSubmit={(data) => updateItemMutation.mutate({ id: editingItem.id, updates: data })}
              isLoading={updateItemMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CreateItemForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData?: MemPodItem; 
  onSubmit: (data: Partial<MemPodItem>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'memory' as MemPodItemType,
    title: initialData?.title || '',
    content: initialData?.content || '',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'active',
    dueDate: initialData?.dueDate || '',
    progress: initialData?.progress || 0,
    tags: initialData?.tags?.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    onSubmit({
      ...formData,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value: MemPodItemType) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="memory">Memory</SelectItem>
              <SelectItem value="goal">Goal</SelectItem>
              <SelectItem value="knowledge">Knowledge</SelectItem>
              <SelectItem value="favorite">Favorite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          required
        />
      </div>

      {formData.type === 'goal' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'completed' | 'paused' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="dueDate">Due Date (optional)</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="productivity, personal, work"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}