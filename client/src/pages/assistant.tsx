import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import NavigationSidebar from '@/components/layout/navigation-sidebar';
import LiveActivity from '@/components/dashboard/live-activity';
import TrendingTopics from '@/components/dashboard/trending-topics';
import QuickActions from '@/components/dashboard/quick-actions';
import GlassCard from '@/components/ui/glass-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Trash2,
  Database,
  StickyNote,
  Archive
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
                <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 p-1 rounded-xl">
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
                  <TabsTrigger 
                    value="mempod" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Mempod</span>
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

              {/* Mempod Tab */}
              <TabsContent value="mempod" className="space-y-6">
                <Tabs defaultValue="knowledge" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 p-1 rounded-xl">
                    <TabsTrigger 
                      value="capture" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Capture</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="projects" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <Target className="w-4 h-4" />
                      <span>Projects</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="areas" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <Monitor className="w-4 h-4" />
                      <span>Areas</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="resources" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <Database className="w-4 h-4" />
                      <span>Resources</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="archives" 
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Archives</span>
                    </TabsTrigger>
                  </TabsList>

                  <MempodCapture />
                  <MempodProjects />
                  <MempodAreas />
                  <MempodResources />
                  <MempodArchives />
                </Tabs>
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

// Mempod Knowledge Component
function MempodKnowledge() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: '',
    source: '',
    tags: []
  });

  // Fetch knowledge items
  const { data: knowledge = [], isLoading } = useQuery({
    queryKey: ['/api/mempod/knowledge'],
    enabled: !!user,
  });

  // Create knowledge mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('/api/mempod/knowledge', 'POST', data),
    onSuccess: () => {
      toast({ title: "Knowledge Added", description: "New knowledge item has been created." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/knowledge'] });
      setShowAddDialog(false);
      setNewItem({ title: '', content: '', category: '', source: '', tags: [] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create knowledge item.", variant: "destructive" });
    }
  });

  // Update knowledge mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest(`/api/mempod/knowledge/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({ title: "Knowledge Updated", description: "Knowledge item has been updated." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/knowledge'] });
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update knowledge item.", variant: "destructive" });
    }
  });

  // Delete knowledge mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/mempod/knowledge/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Knowledge Deleted", description: "Knowledge item has been removed." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/knowledge'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete knowledge item.", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!newItem.title.trim() || !newItem.content.trim()) return;
    createMutation.mutate(newItem);
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    updateMutation.mutate(editingItem);
  };

  return (
    <TabsContent value="knowledge" className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Knowledge Base</span>
            </CardTitle>
            <CardDescription>Store and organize information for your assistant to access</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Knowledge
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : knowledge.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Database className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">No knowledge items yet</p>
              <p className="text-sm">Start building your knowledge base by adding your first item.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {knowledge.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {item.category && (
                          <Badge variant="secondary">{item.category}</Badge>
                        )}
                        {item.source && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {item.source}
                          </span>
                        )}
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Knowledge Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Knowledge Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Knowledge item title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newItem.content}
                onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Detailed information and insights"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Research, Personal, Work"
                />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={newItem.source}
                  onChange={(e) => setNewItem(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Source URL or reference"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Knowledge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Knowledge item title"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingItem.content}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed information and insights"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Research, Personal, Work"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-source">Source</Label>
                  <Input
                    id="edit-source"
                    value={editingItem.source || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="Source URL or reference"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Knowledge'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

// Mempod Notes Component
function MempodNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: '',
    isPinned: false,
    tags: []
  });

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['/api/mempod/notes'],
    enabled: !!user,
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('/api/mempod/notes', 'POST', data),
    onSuccess: () => {
      toast({ title: "Note Added", description: "New note has been created." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/notes'] });
      setShowAddDialog(false);
      setNewItem({ title: '', content: '', category: '', isPinned: false, tags: [] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create note.", variant: "destructive" });
    }
  });

  // Update note mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest(`/api/mempod/notes/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({ title: "Note Updated", description: "Note has been updated." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/notes'] });
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update note.", variant: "destructive" });
    }
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/mempod/notes/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Note Deleted", description: "Note has been removed." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/notes'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete note.", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!newItem.title.trim() || !newItem.content.trim()) return;
    createMutation.mutate(newItem);
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    updateMutation.mutate(editingItem);
  };

  const togglePin = (note: any) => {
    updateMutation.mutate({
      ...note,
      isPinned: !note.isPinned
    });
  };

  return (
    <TabsContent value="notes" className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <StickyNote className="w-5 h-5" />
              <span>Notes</span>
            </CardTitle>
            <CardDescription>Quick notes and memos for reference</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Note
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <StickyNote className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">No notes yet</p>
              <p className="text-sm">Create your first note to start organizing your thoughts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note: any) => (
                <div key={note.id} className={`border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${note.isPinned ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{note.title}</h3>
                        {note.isPinned && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">{note.content}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {note.category && (
                          <Badge variant="secondary">{note.category}</Badge>
                        )}
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(note)}
                        className={note.isPinned ? 'text-yellow-600' : ''}
                      >
                        <Heart className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(note)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(note.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title"
              />
            </div>
            <div>
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={newItem.content}
                onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Note content and thoughts"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="note-category">Category</Label>
                <Input
                  id="note-category"
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Quick, Important, Idea"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="pin-note"
                  checked={newItem.isPinned}
                  onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, isPinned: !!checked }))}
                />
                <Label htmlFor="pin-note">Pin this note</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-note-title">Title</Label>
                <Input
                  id="edit-note-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Note title"
                />
              </div>
              <div>
                <Label htmlFor="edit-note-content">Content</Label>
                <Textarea
                  id="edit-note-content"
                  value={editingItem.content}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Note content and thoughts"
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-note-category">Category</Label>
                  <Input
                    id="edit-note-category"
                    value={editingItem.category || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Quick, Important, Idea"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="edit-pin-note"
                    checked={editingItem.isPinned}
                    onCheckedChange={(checked) => setEditingItem(prev => ({ ...prev, isPinned: !!checked }))}
                  />
                  <Label htmlFor="edit-pin-note">Pin this note</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Note'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

// Mempod Goals Component
function MempodGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    targetDate: '',
    priority: 'medium',
    status: 'not_started',
    progress: 0,
    tags: []
  });

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['/api/mempod/goals'],
    enabled: !!user,
  });

  // Create goal mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest('/api/mempod/goals', 'POST', data),
    onSuccess: () => {
      toast({ title: "Goal Added", description: "New goal has been created." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/goals'] });
      setShowAddDialog(false);
      setNewItem({ title: '', description: '', targetDate: '', priority: 'medium', status: 'not_started', progress: 0, tags: [] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create goal.", variant: "destructive" });
    }
  });

  // Update goal mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest(`/api/mempod/goals/${id}`, 'PUT', data),
    onSuccess: () => {
      toast({ title: "Goal Updated", description: "Goal has been updated." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/goals'] });
      setEditingItem(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update goal.", variant: "destructive" });
    }
  });

  // Delete goal mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/mempod/goals/${id}`, 'DELETE'),
    onSuccess: () => {
      toast({ title: "Goal Deleted", description: "Goal has been removed." });
      queryClient.invalidateQueries({ queryKey: ['/api/mempod/goals'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete goal.", variant: "destructive" });
    }
  });

  const handleSubmit = () => {
    if (!newItem.title.trim()) return;
    const goalData = {
      ...newItem,
      targetDate: newItem.targetDate ? new Date(newItem.targetDate).toISOString() : null
    };
    createMutation.mutate(goalData);
  };

  const handleUpdate = () => {
    if (!editingItem) return;
    const goalData = {
      ...editingItem,
      targetDate: editingItem.targetDate ? new Date(editingItem.targetDate).toISOString() : null
    };
    updateMutation.mutate(goalData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <TabsContent value="goals" className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Goals & Metrics</span>
            </CardTitle>
            <CardDescription>Set and track your personal and professional goals</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Target className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-medium mb-2">No goals yet</p>
              <p className="text-sm">Set your first goal to start tracking your progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal: any) => (
                <div key={goal.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-lg">{goal.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(goal.status)}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{goal.description}</p>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${goal.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        {goal.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                        <span>Created {new Date(goal.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingItem(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Title</Label>
              <Input
                id="goal-title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Goal title"
              />
            </div>
            <div>
              <Label htmlFor="goal-description">Description</Label>
              <Textarea
                id="goal-description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your goal in detail"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="goal-priority">Priority</Label>
                <Select
                  value={newItem.priority}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, priority: value }))}
                >
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
              <div>
                <Label htmlFor="goal-status">Status</Label>
                <Select
                  value={newItem.status}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="goal-target-date">Target Date</Label>
                <Input
                  id="goal-target-date"
                  type="date"
                  value={newItem.targetDate}
                  onChange={(e) => setNewItem(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="goal-progress">Progress (%)</Label>
              <Slider
                value={[newItem.progress]}
                onValueChange={([value]) => setNewItem(prev => ({ ...prev, progress: value }))}
                max={100}
                step={5}
                className="mt-2"
              />
              <div className="text-center text-sm text-slate-500 mt-1">{newItem.progress}%</div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-goal-title">Title</Label>
                <Input
                  id="edit-goal-title"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Goal title"
                />
              </div>
              <div>
                <Label htmlFor="edit-goal-description">Description</Label>
                <Textarea
                  id="edit-goal-description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal in detail"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-goal-priority">Priority</Label>
                  <Select
                    value={editingItem.priority}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, priority: value }))}
                  >
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
                <div>
                  <Label htmlFor="edit-goal-status">Status</Label>
                  <Select
                    value={editingItem.status}
                    onValueChange={(value) => setEditingItem(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-goal-target-date">Target Date</Label>
                  <Input
                    id="edit-goal-target-date"
                    type="date"
                    value={editingItem.targetDate ? new Date(editingItem.targetDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-goal-progress">Progress (%)</Label>
                <Slider
                  value={[editingItem.progress]}
                  onValueChange={([value]) => setEditingItem(prev => ({ ...prev, progress: value }))}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="text-center text-sm text-slate-500 mt-1">{editingItem.progress}%</div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Goal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

// Second Brain PARA Method Components

// Quick Capture - Inbox for rapid note-taking
function MempodCapture() {
  return (
    <TabsContent value="capture" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Capture</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your inbox for rapid note-taking and idea capture</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Quick Capture
        </Button>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-600 dark:text-gray-400 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Quick Capture Inbox</h4>
            <p className="text-sm">
              Rapidly collect thoughts, ideas, and notes without worrying about organization. 
              Everything captured here can later be processed into the appropriate PARA categories.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white/50 rounded-lg p-3">
              <strong>P</strong> → Projects
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <strong>A</strong> → Areas
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <strong>R</strong> → Resources
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <strong>Archive</strong> → Inactive
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

// Projects - Things with outcomes and deadlines
function MempodProjects() {
  return (
    <TabsContent value="projects" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Things with specific outcomes and deadlines</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-600 dark:text-gray-400 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Active Projects</h4>
            <p className="text-sm">
              Projects are efforts with specific outcomes and deadlines. Examples: "Launch new website", "Complete certification", "Plan vacation".
              Each project should have a clear deliverable and timeline.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="font-medium">Outcome</div>
              <div>Specific result</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="font-medium">Deadline</div>
              <div>Clear timeline</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="font-medium">Actions</div>
              <div>Next steps</div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

// Areas - Ongoing responsibilities and standards to maintain
function MempodAreas() {
  return (
    <TabsContent value="areas" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Areas of Responsibility</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ongoing responsibilities and standards to maintain</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          New Area
        </Button>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-600 dark:text-gray-400 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center">
            <Monitor className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Life Areas</h4>
            <p className="text-sm">
              Areas are ongoing responsibilities without end dates. Examples: "Health & Fitness", "Professional Development", "Family".
              These require regular attention and have standards to maintain.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="font-medium">Standard</div>
              <div>What good looks like</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="font-medium">Review</div>
              <div>Regular check-ins</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="font-medium">Maintain</div>
              <div>Ongoing effort</div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

// Resources - Topics of ongoing interest (enhanced knowledge base)
function MempodResources() {
  return (
    <TabsContent value="resources" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resources</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Topics of ongoing interest for future reference</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-600 dark:text-gray-400 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
            <Database className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Knowledge Resources</h4>
            <p className="text-sm">
              Resources are topics you're interested in for future reference. Examples: "Web Design Trends", "Productivity Tools", "Investment Strategies".
              These contain reference materials you might need someday.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="font-medium">Articles</div>
              <div>Saved reads</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="font-medium">Tools</div>
              <div>Useful software</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="font-medium">Learning</div>
              <div>Future study</div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

// Archives - Inactive items from other categories
function MempodArchives() {
  return (
    <TabsContent value="archives" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Archives</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed or inactive items from other categories</p>
        </div>
        <Button variant="outline" className="border-gray-300 dark:border-gray-600">
          <Archive className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-center text-gray-600 dark:text-gray-400 space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center">
            <Archive className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Archived Items</h4>
            <p className="text-sm">
              Archives contain inactive items from your Projects, Areas, and Resources. 
              Completed projects, former responsibilities, and outdated resources live here for reference.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-medium">Completed</div>
              <div>Finished projects</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-medium">Former</div>
              <div>Past responsibilities</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="font-medium">Outdated</div>
              <div>Old resources</div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

export default Assistant;