import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import NavigationSidebar from '@/components/layout/navigation-sidebar';
import LiveActivity from '@/components/dashboard/live-activity';
import TrendingTopics from '@/components/dashboard/trending-topics';
import QuickActions from '@/components/dashboard/quick-actions';
import GlassCard from '@/components/ui/glass-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Brain, 
  Calendar, 
  Heart, 
  Save, 
  Plus, 
  X, 
  Settings, 
  Target,
  Monitor,
  Clock,
  Shield,
  Zap,
  Globe,
  Users,
  Eye,
  Edit,
  Pause,
  Trash2
} from 'lucide-react';

interface AssistantConfig {
  personality: {
    name: string;
    communicationStyle: string;
    tone: number;
    expertise: number;
    contentPreferences: string[];
    interests: string[];
  };
  intelligence: {
    socialMedia: {
      linkedin: string;
      twitter: string;
      facebook: string;
      instagram: string;
    };
    rssFeeds: string[];
    keyPeople: string[];
    briefingSchedule: {
      morning: string;
      evening: string;
      format: string;
    };
  };
  tasks: {
    qualityThreshold: number;
    recencyWeight: number;
    activeTasks: Array<{
      id: string;
      name: string;
      frequency: string;
      time: string;
      instructions: string;
      status: string;
    }>;
  };
  engagement: {
    autonomyLevel: number;
    postsPerDay: string;
    postVisibility: string;
    approvalPrompt: string;
    engagementStrategy: string[];
    contentGuidelines: string;
    safetySettings: string[];
  };
}

const COMMUNICATION_STYLES = [
  'Professional & Analytical',
  'Casual & Friendly',
  'Formal & Academic',
  'Creative & Expressive'
];

const CONTENT_PREFERENCES = [
  'Industry Insights',
  'Technical Deep Dives',
  'Opinion Pieces',
  'Research Summaries',
  'Personal Stories',
  'How-To Guides'
];

const BRIEFING_FORMATS = [
  'Executive Summary (2-3 key insights)',
  'Detailed Report (5-7 insights with context)',
  'Quick Highlights (1-2 sentences each)'
];

const FREQUENCY_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

const AUTONOMY_LEVELS = [
  { level: 1, label: 'Manual Approval', description: 'All actions require approval' },
  { level: 2, label: 'Suggested Actions', description: 'AI suggests, user approves' },
  { level: 3, label: 'Semi-Autonomous', description: 'AI can like/share, approval for comments' },
  { level: 4, label: 'Mostly Autonomous', description: 'AI engages freely, daily summary' },
  { level: 5, label: 'Fully Autonomous', description: 'Complete automation, weekly oversight' }
];

const ENGAGEMENT_STRATEGIES = [
  'Auto-like relevant posts',
  'Share with commentary',
  'Reply to comments on my posts',
  'Initiate conversations',
  'Engage with network posts',
  'Follow suggested accounts'
];

const SAFETY_SETTINGS = [
  'Fact-check before sharing',
  'Avoid controversial topics',
  'Never engage in debates',
  'Maintain professional tone'
];

function Assistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<AssistantConfig>({
    personality: {
      name: 'Watch Tower',
      communicationStyle: 'Professional & Analytical',
      tone: 70,
      expertise: 80,
      contentPreferences: ['Industry Insights', 'Technical Deep Dives'],
      interests: ['AI', 'Machine Learning', 'Data Science']
    },
    intelligence: {
      socialMedia: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      },
      rssFeeds: [],
      keyPeople: [],
      briefingSchedule: {
        morning: '08:00',
        evening: '18:00',
        format: 'Executive Summary (2-3 key insights)'
      }
    },
    tasks: {
      qualityThreshold: 80,
      recencyWeight: 30,
      activeTasks: []
    },
    engagement: {
      autonomyLevel: 2,
      postsPerDay: '3-4 posts',
      postVisibility: 'Draft for Review',
      approvalPrompt: '',
      engagementStrategy: [],
      contentGuidelines: '',
      safetySettings: ['Fact-check before sharing', 'Maintain professional tone']
    }
  });

  const [taskModal, setTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    frequency: 'Daily',
    time: '09:00',
    instructions: ''
  });
  
  const [tempInputs, setTempInputs] = useState({
    rssUrl: '',
    personName: ''
  });

  // Load existing assistant configuration
  const { data: assistant } = useQuery({
    queryKey: ['/api/assistant'],
    enabled: !!user,
  });

  // Update local config when assistant data loads
  useEffect(() => {
    if (assistant && typeof assistant === 'object') {
      setConfig(prev => ({
        ...prev,
        personality: {
          name: (assistant as any).name || 'Watch Tower',
          communicationStyle: (assistant as any).communicationStyle || 'Professional & Analytical',
          tone: (assistant as any).tone || 70,
          expertise: (assistant as any).expertiseLevel || 80,
          contentPreferences: (assistant as any).contentPreferences || ['Industry Insights', 'Technical Deep Dives'],
          interests: (assistant as any).interests || ['AI', 'Machine Learning', 'Data Science']
        },
        intelligence: {
          socialMedia: (assistant as any).socialMediaProfiles || {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
          },
          rssFeeds: (assistant as any).rssFeeds || [],
          keyPeople: (assistant as any).keyPeopleToMonitor || [],
          briefingSchedule: (assistant as any).briefingSchedule || {
            morning: '08:00',
            evening: '18:00',
            format: 'Executive Summary (2-3 key insights)'
          }
        },
        tasks: {
          qualityThreshold: (assistant as any).qualityThreshold || 80,
          recencyWeight: (assistant as any).recencyWeight || 30,
          activeTasks: (assistant as any).activeTasks || []
        },
        engagement: {
          autonomyLevel: (assistant as any).autonomyLevel || 2,
          postsPerDay: (assistant as any).postsPerDay || '3-4 posts',
          postVisibility: (assistant as any).postVisibility || 'Draft for Review',
          approvalPrompt: (assistant as any).approvalPromptTemplate || '',
          engagementStrategy: (assistant as any).engagementStrategy || [],
          contentGuidelines: (assistant as any).contentGuidelines || '',
          safetySettings: (assistant as any).safetySettings || ['Fact-check before sharing', 'Maintain professional tone']
        }
      }));
    }
  }, [assistant]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: AssistantConfig) => {
      return apiRequest('/api/assistant', 'POST', configData);
    },
    onSuccess: () => {
      toast({
        title: "Configuration Saved",
        description: "Your assistant configuration has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assistant'] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const addRSSFeed = () => {
    if (tempInputs.rssUrl.trim()) {
      setConfig(prev => ({
        ...prev,
        intelligence: {
          ...prev.intelligence,
          rssFeeds: [...prev.intelligence.rssFeeds, tempInputs.rssUrl.trim()]
        }
      }));
      setTempInputs(prev => ({ ...prev, rssUrl: '' }));
    }
  };

  const removeRSSFeed = (index: number) => {
    setConfig(prev => ({
      ...prev,
      intelligence: {
        ...prev.intelligence,
        rssFeeds: prev.intelligence.rssFeeds.filter((_, i) => i !== index)
      }
    }));
  };

  const addKeyPerson = () => {
    if (tempInputs.personName.trim()) {
      setConfig(prev => ({
        ...prev,
        intelligence: {
          ...prev.intelligence,
          keyPeople: [...prev.intelligence.keyPeople, tempInputs.personName.trim()]
        }
      }));
      setTempInputs(prev => ({ ...prev, personName: '' }));
    }
  };

  const removeKeyPerson = (index: number) => {
    setConfig(prev => ({
      ...prev,
      intelligence: {
        ...prev.intelligence,
        keyPeople: prev.intelligence.keyPeople.filter((_, i) => i !== index)
      }
    }));
  };

  const addTask = () => {
    if (newTask.name.trim() && newTask.instructions.trim()) {
      const task = {
        id: Date.now().toString(),
        ...newTask,
        status: 'active'
      };
      setConfig(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          activeTasks: [...prev.tasks.activeTasks, task]
        }
      }));
      setNewTask({
        name: '',
        frequency: 'Daily',
        time: '09:00',
        instructions: ''
      });
      setTaskModal(false);
    }
  };

  const removeTask = (taskId: string) => {
    setConfig(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        activeTasks: prev.tasks.activeTasks.filter(task => task.id !== taskId)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="container mx-auto max-w-8xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-6 space-y-6">
            {/* Header */}
            <div className="glass-morphism rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-extrabold gradient-text mb-2">My Assistant</h1>
                  <p className="text-slate-600 text-lg">Configure your personal AI intelligence companion</p>
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={saveConfigMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>

            {/* Configuration Tabs */}
            <div className="glass-morphism rounded-3xl p-6 shadow-xl">
              <Tabs defaultValue="personality" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 p-1 rounded-xl">
                  <TabsTrigger 
                    value="personality" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Personality</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="intelligence" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Intelligence</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="engagement" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Engagement</span>
                  </TabsTrigger>
                </TabsList>

              {/* Personality Tab */}
              <TabsContent value="personality" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="w-5 h-5" />
                      <span>Assistant Identity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="assistant-name">Assistant Name</Label>
                        <Input
                          id="assistant-name"
                          value={config.personality.name}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            personality: { ...prev.personality, name: e.target.value }
                          }))}
                          placeholder="Watch Tower"
                        />
                      </div>
                      <div>
                        <Label htmlFor="communication-style">Communication Style</Label>
                        <Select
                          value={config.personality.communicationStyle}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            personality: { ...prev.personality, communicationStyle: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMUNICATION_STYLES.map(style => (
                              <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>Tone Preference: {config.personality.tone}%</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-slate-500">Conservative</span>
                          <Slider
                            value={[config.personality.tone]}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              personality: { ...prev.personality, tone: value[0] }
                            }))}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-slate-500">Bold</span>
                        </div>
                      </div>
                      <div>
                        <Label>Expertise Level: {config.personality.expertise}%</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-slate-500">Beginner-Friendly</span>
                          <Slider
                            value={[config.personality.expertise]}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              personality: { ...prev.personality, expertise: value[0] }
                            }))}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-slate-500">Expert</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Content Preferences</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {CONTENT_PREFERENCES.map(pref => (
                          <div key={pref} className="flex items-center space-x-2">
                            <Checkbox
                              checked={config.personality.contentPreferences.includes(pref)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConfig(prev => ({
                                    ...prev,
                                    personality: {
                                      ...prev.personality,
                                      contentPreferences: [...prev.personality.contentPreferences, pref]
                                    }
                                  }));
                                } else {
                                  setConfig(prev => ({
                                    ...prev,
                                    personality: {
                                      ...prev.personality,
                                      contentPreferences: prev.personality.contentPreferences.filter(p => p !== pref)
                                    }
                                  }));
                                }
                              }}
                            />
                            <Label className="text-sm">{pref}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Interests & Expertise</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {config.personality.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{interest}</span>
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => setConfig(prev => ({
                                ...prev,
                                personality: {
                                  ...prev.personality,
                                  interests: prev.personality.interests.filter((_, i) => i !== index)
                                }
                              }))}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Intelligence Tab */}
              <TabsContent value="intelligence" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="w-5 h-5" />
                      <span>Social Media Monitoring</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                        <Input
                          id="linkedin"
                          value={config.intelligence.socialMedia.linkedin}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              socialMedia: { ...prev.intelligence.socialMedia, linkedin: e.target.value }
                            }
                          }))}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter/X Handle</Label>
                        <Input
                          id="twitter"
                          value={config.intelligence.socialMedia.twitter}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              socialMedia: { ...prev.intelligence.socialMedia, twitter: e.target.value }
                            }
                          }))}
                          placeholder="@yourusername"
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook Page</Label>
                        <Input
                          id="facebook"
                          value={config.intelligence.socialMedia.facebook}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              socialMedia: { ...prev.intelligence.socialMedia, facebook: e.target.value }
                            }
                          }))}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram Handle</Label>
                        <Input
                          id="instagram"
                          value={config.intelligence.socialMedia.instagram}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              socialMedia: { ...prev.intelligence.socialMedia, instagram: e.target.value }
                            }
                          }))}
                          placeholder="@yourusername"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>RSS Feeds & News Sources</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={tempInputs.rssUrl}
                        onChange={(e) => setTempInputs(prev => ({ ...prev, rssUrl: e.target.value }))}
                        placeholder="Enter RSS feed URL"
                        className="flex-1"
                      />
                      <Button onClick={addRSSFeed}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Feed
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.intelligence.rssFeeds.map((feed, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                          <span className="text-sm">{feed}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeRSSFeed(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Key People to Monitor</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={tempInputs.personName}
                        onChange={(e) => setTempInputs(prev => ({ ...prev, personName: e.target.value }))}
                        placeholder="Enter name or handle"
                        className="flex-1"
                      />
                      <Button onClick={addKeyPerson}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Person
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.intelligence.keyPeople.map((person, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                          <span className="text-sm">{person}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeKeyPerson(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Intelligence Briefing Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="morning-time">Morning Briefing</Label>
                        <Input
                          id="morning-time"
                          type="time"
                          value={config.intelligence.briefingSchedule.morning}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              briefingSchedule: { ...prev.intelligence.briefingSchedule, morning: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="evening-time">Evening Summary</Label>
                        <Input
                          id="evening-time"
                          type="time"
                          value={config.intelligence.briefingSchedule.evening}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              briefingSchedule: { ...prev.intelligence.briefingSchedule, evening: e.target.value }
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="briefing-format">Briefing Format</Label>
                        <Select
                          value={config.intelligence.briefingSchedule.format}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            intelligence: {
                              ...prev.intelligence,
                              briefingSchedule: { ...prev.intelligence.briefingSchedule, format: value }
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BRIEFING_FORMATS.map(format => (
                              <SelectItem key={format} value={format}>{format}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>Task Creation</span>
                      </div>
                      <Dialog open={taskModal} onOpenChange={setTaskModal}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="task-name">Task Name</Label>
                              <Input
                                id="task-name"
                                value={newTask.name}
                                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter task name"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="task-frequency">Frequency</Label>
                                <Select
                                  value={newTask.frequency}
                                  onValueChange={(value) => setNewTask(prev => ({ ...prev, frequency: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FREQUENCY_OPTIONS.map(freq => (
                                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="task-time">Execution Time</Label>
                                <Input
                                  id="task-time"
                                  type="time"
                                  value={newTask.time}
                                  onChange={(e) => setNewTask(prev => ({ ...prev, time: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="task-instructions">Instructions</Label>
                              <Textarea
                                id="task-instructions"
                                value={newTask.instructions}
                                onChange={(e) => setNewTask(prev => ({ ...prev, instructions: e.target.value }))}
                                placeholder="Detailed task instructions"
                                rows={4}
                              />
                            </div>
                            <Button onClick={addTask} className="w-full">Create Task</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {config.tasks.activeTasks.map(task => (
                        <div key={task.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${task.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <h4 className="font-semibold">{task.name}</h4>
                              <Badge variant="outline">{task.frequency}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Pause className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{task.instructions}</p>
                          <div className="text-xs text-slate-500">
                            Executes {task.frequency.toLowerCase()} at {task.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Relevance Scoring Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>Quality Threshold: {config.tasks.qualityThreshold}%</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-slate-500">Low Quality</span>
                          <Slider
                            value={[config.tasks.qualityThreshold]}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              tasks: { ...prev.tasks, qualityThreshold: value[0] }
                            }))}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-slate-500">High Quality Only</span>
                        </div>
                      </div>
                      <div>
                        <Label>Recency Weight: {config.tasks.recencyWeight}%</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-slate-500">Timeless Content</span>
                          <Slider
                            value={[config.tasks.recencyWeight]}
                            onValueChange={(value) => setConfig(prev => ({
                              ...prev,
                              tasks: { ...prev.tasks, recencyWeight: value[0] }
                            }))}
                            max={100}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-slate-500">Breaking News Focus</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Engagement Tab */}
              <TabsContent value="engagement" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Automation Level Control</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label>AI Autonomy Level: {config.engagement.autonomyLevel}</Label>
                      <div className="space-y-3">
                        {AUTONOMY_LEVELS.map(level => (
                          <div
                            key={level.level}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              config.engagement.autonomyLevel === level.level
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setConfig(prev => ({
                              ...prev,
                              engagement: { ...prev.engagement, autonomyLevel: level.level }
                            }))}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{level.label}</h4>
                                <p className="text-sm text-slate-600">{level.description}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                config.engagement.autonomyLevel === level.level
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Content Creation Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="posts-per-day">Posts Per Day</Label>
                        <Select
                          value={config.engagement.postsPerDay}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            engagement: { ...prev.engagement, postsPerDay: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2 posts">1-2 posts</SelectItem>
                            <SelectItem value="3-4 posts">3-4 posts</SelectItem>
                            <SelectItem value="5-6 posts">5-6 posts</SelectItem>
                            <SelectItem value="Custom schedule">Custom schedule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="post-visibility">Post Visibility</Label>
                        <Select
                          value={config.engagement.postVisibility}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            engagement: { ...prev.engagement, postVisibility: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Always Public">Always Public</SelectItem>
                            <SelectItem value="Draft for Review">Draft for Review</SelectItem>
                            <SelectItem value="Private by Default">Private by Default</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Label htmlFor="approval-prompt">Approval Prompt Template</Label>
                      <Textarea
                        id="approval-prompt"
                        value={config.engagement.approvalPrompt}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          engagement: { ...prev.engagement, approvalPrompt: e.target.value }
                        }))}
                        placeholder="Template for AI approval requests"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Engagement Strategy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {ENGAGEMENT_STRATEGIES.map(strategy => (
                        <div key={strategy} className="flex items-center space-x-2">
                          <Checkbox
                            checked={config.engagement.engagementStrategy.includes(strategy)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setConfig(prev => ({
                                  ...prev,
                                  engagement: {
                                    ...prev.engagement,
                                    engagementStrategy: [...prev.engagement.engagementStrategy, strategy]
                                  }
                                }));
                              } else {
                                setConfig(prev => ({
                                  ...prev,
                                  engagement: {
                                    ...prev.engagement,
                                    engagementStrategy: prev.engagement.engagementStrategy.filter(s => s !== strategy)
                                  }
                                }));
                              }
                            }}
                          />
                          <Label className="text-sm">{strategy}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Safety & Boundaries</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="content-guidelines">Content Guidelines</Label>
                      <Textarea
                        id="content-guidelines"
                        value={config.engagement.contentGuidelines}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          engagement: { ...prev.engagement, contentGuidelines: e.target.value }
                        }))}
                        placeholder="Define content restrictions and guidelines"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Safety Options</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {SAFETY_SETTINGS.map(setting => (
                          <div key={setting} className="flex items-center space-x-2">
                            <Checkbox
                              checked={config.engagement.safetySettings.includes(setting)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setConfig(prev => ({
                                    ...prev,
                                    engagement: {
                                      ...prev.engagement,
                                      safetySettings: [...prev.engagement.safetySettings, setting]
                                    }
                                  }));
                                } else {
                                  setConfig(prev => ({
                                    ...prev,
                                    engagement: {
                                      ...prev.engagement,
                                      safetySettings: prev.engagement.safetySettings.filter(s => s !== setting)
                                    }
                                  }));
                                }
                              }}
                            />
                            <Label className="text-sm">{setting}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <LiveActivity />
            <TrendingTopics />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assistant;