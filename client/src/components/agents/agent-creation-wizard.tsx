import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import GlassCard from "@/components/ui/glass-card";
import AgentAvatar from "@/components/ui/agent-avatar";
import { 
  Bot, 
  Sparkles, 
  Brain, 
  Code, 
  PenTool, 
  BarChart, 
  Palette, 
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  TrendingUp,
  Search,
  Music,
  Zap,
  Users2,
  Target,
  GraduationCap,
  Lightbulb,
  Heart,
  MessageCircle,
  Shuffle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AgentCreationWizardProps {
  onClose: () => void;
}

interface AgentData {
  name: string;
  alias: string;
  description: string;
  expertise: string;
  personality: string;
  avatar: string;
  focusAreas: string[];
}

const interestAreaOptions = [
  // General & Communication (Row 1)
  { value: "communication", label: "Communication", icon: Users, color: "from-blue-500 to-blue-600" },
  { value: "education", label: "Education", icon: Brain, color: "from-green-500 to-green-600" },
  { value: "counseling", label: "Counseling", icon: Sparkles, color: "from-purple-500 to-purple-600" },
  { value: "entertainment", label: "Entertainment", icon: Sparkles, color: "from-yellow-500 to-yellow-600" },
  
  // Personal & Lifestyle (Row 2)
  { value: "motivation", label: "Motivation", icon: Sparkles, color: "from-orange-500 to-orange-600" },
  { value: "wellness", label: "Wellness", icon: Sparkles, color: "from-red-500 to-red-600" },
  { value: "relationships", label: "Relationships", icon: Users, color: "from-pink-600 to-pink-700" },
  { value: "lifestyle", label: "Lifestyle", icon: Sparkles, color: "from-teal-500 to-teal-600" },
  
  // Creative & Arts (Row 3)
  { value: "writing", label: "Writing", icon: PenTool, color: "from-indigo-500 to-indigo-600" },
  { value: "storytelling", label: "Storytelling", icon: Brain, color: "from-pink-500 to-pink-600" },
  { value: "comedy", label: "Comedy", icon: Sparkles, color: "from-amber-500 to-amber-600" },
  { value: "roleplay", label: "Roleplay", icon: Users, color: "from-rose-500 to-rose-600" },
  
  // Knowledge & Wisdom (Row 4)
  { value: "philosophy", label: "Philosophy", icon: Brain, color: "from-slate-500 to-slate-600" },
  { value: "history", label: "History", icon: Brain, color: "from-emerald-500 to-emerald-600" },
  { value: "science", label: "Science", icon: Brain, color: "from-cyan-600 to-cyan-700" },
  { value: "religious", label: "Religious", icon: Sparkles, color: "from-amber-600 to-amber-700" },
  
  // Professional & Business (Row 5)
  { value: "business", label: "Business", icon: Users, color: "from-orange-600 to-orange-700" },
  { value: "marketing", label: "Marketing", icon: Users, color: "from-purple-600 to-purple-700" },
  { value: "research", label: "Research", icon: Brain, color: "from-blue-600 to-blue-700" },
  { value: "language", label: "Languages", icon: Brain, color: "from-indigo-600 to-indigo-700" },
  
  // Skills & Technical (Row 6)
  { value: "design", label: "Design", icon: Palette, color: "from-cyan-500 to-cyan-600" },
  { value: "gaming", label: "Gaming", icon: Bot, color: "from-violet-500 to-violet-600" },
  { value: "productivity", label: "Productivity", icon: Bot, color: "from-emerald-600 to-emerald-700" },
  { value: "analytics", label: "Analytics", icon: BarChart, color: "from-slate-600 to-slate-700" },
  { value: "development", label: "Development", icon: Code, color: "from-gray-500 to-gray-600" }
];

const personalityTraits = [
  // Core Personality
  "Friendly", "Witty", "Wise", "Energetic", "Calm", "Mysterious",
  "Optimistic", "Playful", "Serious", "Caring", "Confident", "Humble",
  
  // Character Types
  "Mentor", "Companion", "Helper", "Entertainer", "Teacher", "Advisor",
  "Storyteller", "Comedian", "Philosopher", "Explorer", "Artist", "Scientist",
  
  // Communication Style
  "Casual", "Formal", "Poetic", "Direct", "Encouraging", "Thoughtful",
  "Dramatic", "Sarcastic", "Gentle", "Bold", "Patient", "Passionate"
];

const avatarOptions = [
  "from-blue-500 to-purple-600",
  "from-green-500 to-emerald-600", 
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-indigo-500 to-blue-600",
  "from-teal-500 to-cyan-600"
];

// Generate URL-friendly alias from agent name
const generateAlias = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

export default function AgentCreationWizard({ onClose }: AgentCreationWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState<AgentData>({
    name: "",
    alias: "",
    description: "",
    expertise: "",
    personality: "",
    avatar: avatarOptions[0],
    focusAreas: [],
  });

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedInterestAreas, setSelectedInterestAreas] = useState<string[]>([]);
  const [aliasCheckLoading, setAliasCheckLoading] = useState(false);
  const [aliasAvailable, setAliasAvailable] = useState<boolean | null>(null);

  // Enhanced name suggestions based on different categories
  const getNameSuggestions = () => {
    const suggestions = [
      // Creative & Artistic
      "Aurora", "Muse", "Prism", "Canvas", "Lyric", "Verse", "Palette", "Echo",
      // Professional & Business
      "Nexus", "Pinnacle", "Catalyst", "Summit", "Forge", "Apex", "Vanguard", "Quantum",
      // Friendly & Social
      "Harmony", "Sage", "Compass", "Bridge", "Haven", "Spark", "Beacon", "Pulse",
      // Tech & Innovation
      "Cipher", "Matrix", "Phoenix", "Nova", "Zenith", "Flux", "Vector", "Synapse",
      // Wisdom & Knowledge
      "Oracle", "Scholar", "Athena", "Edison", "Newton", "Tesla", "Aristotle", "Minerva",
      // Nature & Organic
      "River", "Willow", "Forest", "Storm", "Dawn", "Coral", "Jade", "Sky",
      // Modern & Trendy
      "Zara", "Kai", "Luna", "Felix", "Aria", "Rex", "Nova", "Iris",
      // Character-inspired
      "Gandalf", "Yoda", "Merlin", "Holmes", "Einstein", "Curie", "da Vinci", "Socrates"
    ];
    
    // Shuffle and return 6 random suggestions
    const shuffled = suggestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  const [nameSuggestions, setNameSuggestions] = useState(getNameSuggestions());

  // Generate URL-friendly alias from name
  const generateAlias = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .slice(0, 20); // Limit to 20 characters
  };

  // Check if alias is available
  const checkAliasAvailability = async (alias: string) => {
    if (!alias.trim()) {
      setAliasAvailable(null);
      return;
    }

    setAliasCheckLoading(true);
    try {
      const response = await fetch(`/api/agents/check-alias?alias=${encodeURIComponent(alias)}`);
      const { available } = await response.json();
      setAliasAvailable(available);
    } catch (error) {
      console.error('Error checking alias:', error);
      setAliasAvailable(null);
    } finally {
      setAliasCheckLoading(false);
    }
  };

  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentData) => {
      await apiRequest("POST", "/api/agents", {
        ...data,
        alias: generateAlias(data.name),
        personality: JSON.stringify(selectedTraits),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agent Created Successfully!",
        description: "Your new AI agent is ready to transform your whispers into amazing content.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      onClose();
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
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTraitToggle = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait].slice(0, 5) // Max 5 traits
    );
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (agentData.name.trim().length < 2 || agentData.alias.trim().length < 3 || selectedInterestAreas.length === 0 || selectedTraits.length === 0 || aliasAvailable !== true) {
      toast({
        title: "Validation Error",
        description: "Name must be at least 2 characters, alias at least 3 characters, and all fields must be completed.",
        variant: "destructive",
      });
      return;
    }

    createAgentMutation.mutate({
      ...agentData,
      focusAreas: selectedInterestAreas,
      expertise: selectedInterestAreas.join(", ")
    });
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return agentData.name.trim().length >= 2 && 
               agentData.alias.trim().length >= 3 && 
               aliasAvailable === true;
      case 2:
        return selectedInterestAreas.length >= 2;
      case 3:
        return selectedTraits.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Basic Information";
      case 2: return "Focus Areas";
      case 3: return "Personality Traits";
      case 4: return "Review & Create";
      default: return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold gradient-text mb-2">Create Your AI Agent</h1>
        <p className="text-slate-600">Design a specialized AI agent to transform your ideas into amazing content</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              stepNum < step 
                ? 'bg-green-500 text-white' 
                : stepNum === step 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
            }`}>
              {stepNum < step ? <Check className="h-5 w-5" /> : stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                stepNum < step ? 'bg-green-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <GlassCard className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">{getStepTitle()}</h2>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="agentName" className="text-base font-semibold">Agent Name *</Label>
              <Input
                id="agentName"
                placeholder="Enter a name or pick from suggestions below"
                value={agentData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setAgentData(prev => ({ ...prev, name: newName }));
                  
                  // Auto-suggest alias if name is provided and alias is empty or was auto-generated
                  if (newName.trim() && (!agentData.alias || agentData.alias === generateAlias(agentData.name))) {
                    const suggestedAlias = generateAlias(newName);
                    setAgentData(prev => ({ ...prev, alias: suggestedAlias }));
                    setAliasAvailable(null);
                    if (suggestedAlias.length >= 3) {
                      checkAliasAvailability(suggestedAlias);
                    }
                  }
                }}
                className="mt-2 text-lg"
                maxLength={50}
              />
              
              {/* Name Suggestions */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600">Quick suggestions:</p>
                  <Button
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNameSuggestions(getNameSuggestions())}
                    className="text-xs h-7"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    More
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {nameSuggestions.map((name) => (
                    <Button
                      key={name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const suggestedAlias = generateAlias(name);
                        setAgentData(prev => ({ ...prev, name, alias: suggestedAlias }));
                        setAliasAvailable(null);
                        if (suggestedAlias.length >= 3) {
                          checkAliasAvailability(suggestedAlias);
                        }
                      }}
                      className="text-sm h-8 hover:bg-blue-50 hover:border-blue-300"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between mt-1">
                <p className="text-sm text-slate-500">Choose a memorable name that reflects your agent's personality</p>
                <span className="text-xs text-slate-400">
                  {agentData.name.length}/50
                </span>
              </div>
              {agentData.name.length > 0 && agentData.name.length < 2 && (
                <p className="text-sm text-red-600 mt-1">Name must be at least 2 characters</p>
              )}
            </div>

            {/* Alias Field */}
            <div>
              <Label htmlFor="agentAlias" className="text-base font-semibold">Agent Handle *</Label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-lg">@</span>
                </div>
                <Input
                  id="agentAlias"
                  placeholder="unique_handle"
                  value={agentData.alias}
                  onChange={(e) => {
                    const newAlias = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setAgentData(prev => ({ ...prev, alias: newAlias }));
                    setAliasAvailable(null);
                    if (newAlias.length >= 3) {
                      checkAliasAvailability(newAlias);
                    }
                  }}
                  className="pl-8 text-lg"
                  maxLength={20}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {aliasCheckLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  {!aliasCheckLoading && aliasAvailable === true && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  {!aliasCheckLoading && aliasAvailable === false && (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              
              {/* Auto-generate button and status */}
              <div className="flex items-center justify-between mt-2">
                {agentData.name && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const generated = generateAlias(agentData.name);
                      setAgentData(prev => ({ ...prev, alias: generated }));
                      setAliasAvailable(null);
                      if (generated.length >= 3) {
                        checkAliasAvailability(generated);
                      }
                    }}
                    className="text-xs"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    Generate from name
                  </Button>
                )}
                
                {/* Auto-suggestion indicator */}
                {agentData.name && agentData.alias === generateAlias(agentData.name) && (
                  <span className="text-xs text-blue-600 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Auto-suggested
                  </span>
                )}
              </div>
              
              {/* Status messages */}
              {aliasAvailable === false && agentData.alias && (
                <p className="text-sm text-red-600 mt-1">@{agentData.alias} is already taken</p>
              )}
              {aliasAvailable === true && agentData.alias && (
                <p className="text-sm text-green-600 mt-1">@{agentData.alias} is available!</p>
              )}
              {agentData.alias && agentData.alias.length < 3 && (
                <p className="text-sm text-slate-500 mt-1">Handle must be at least 3 characters</p>
              )}
              {!agentData.alias && (
                <p className="text-sm text-slate-500 mt-1">Create a unique handle for your agent (e.g., @creative_muse)</p>
              )}
            </div>

            <div>
              <Label htmlFor="agentDescription" className="text-base font-semibold">Identity Details</Label>
              <Textarea
                id="agentDescription"
                placeholder="Define your agent's identity, role, and unique characteristics..."
                value={agentData.description}
                onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2 min-h-24"
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                <p className="text-sm text-slate-500">
                  Describe your agent's personality, expertise, and how it should interact
                </p>
                <span className="text-xs text-slate-400">
                  {agentData.description.length}/500
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">Pro Tip</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Give your agent a personality! The more specific you are about its role and characteristics, 
                    the better it will understand and fulfill your creative needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Interest Areas */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Interest Areas (Choose 2-3) *</Label>
              <p className="text-sm text-slate-600 mb-4">Pick the main areas your agent is passionate about</p>
              <div className="grid grid-cols-4 gap-3">
                {interestAreaOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedInterestAreas.includes(option.value);
                  
                  return (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all duration-200 hover:scale-102 ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 shadow-md bg-blue-50' 
                          : 'hover:shadow-sm'
                      }`}
                      onClick={() => {
                        const newInterestAreas = isSelected 
                          ? selectedInterestAreas.filter(area => area !== option.value)
                          : selectedInterestAreas.length < 3 
                            ? [...selectedInterestAreas, option.value]
                            : selectedInterestAreas;
                        
                        setSelectedInterestAreas(newInterestAreas);
                        setAgentData(prev => ({ 
                          ...prev, 
                          focusAreas: newInterestAreas,
                          expertise: newInterestAreas.join(", "),
                          avatar: option.color 
                        }));
                      }}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 bg-gradient-to-br ${option.color} rounded-md flex items-center justify-center text-white`}>
                            <IconComponent className="h-3 w-3" />
                          </div>
                          <h3 className="font-medium text-xs text-slate-800">{option.label}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {selectedInterestAreas.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Interest Areas Selected ({selectedInterestAreas.length}/3)</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedInterestAreas.map(area => {
                        const option = interestAreaOptions.find(opt => opt.value === area);
                        return (
                          <Badge key={area} className="bg-blue-100 text-blue-800">
                            {option?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Personality Traits */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Select Personality Traits * (Choose up to 5)
              </Label>
              <div className="flex flex-wrap gap-3">
                {personalityTraits.map((trait) => {
                  const isSelected = selectedTraits.includes(trait);
                  
                  return (
                    <Badge
                      key={trait}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
                          : 'hover:bg-slate-100 hover:border-slate-300'
                      }`}
                      onClick={() => handleTraitToggle(trait)}
                    >
                      {trait}
                      {isSelected && <X className="ml-2 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Selected: {selectedTraits.length}/5 traits
              </p>
            </div>

            {selectedTraits.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Your Agent's Personality</h3>
                <p className="text-sm text-purple-700">
                  Your agent will be: {selectedTraits.join(", ").toLowerCase()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Create */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <AgentAvatar 
                name={agentData.name || "New Agent"}
                avatar={agentData.avatar}
                size="lg"
                className="mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{agentData.name || "Unnamed Agent"}</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedInterestAreas.map(area => {
                  const option = interestAreaOptions.find(opt => opt.value === area);
                  return (
                    <Badge key={area} className="bg-blue-100 text-blue-800">
                      {option?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-slate-700">Description</Label>
                <p className="text-slate-600 mt-1">{agentData.description || "No description provided"}</p>
              </div>

              <div>
                <Label className="font-semibold text-slate-700">Personality Traits</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTraits.map((trait) => (
                    <Badge key={trait} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Ready to Create!</h3>
                  <p className="text-sm text-blue-700">
                    Your AI agent will be ready to receive whispers and transform them into amazing content. 
                    You can always modify these settings later in the agent management section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={step === 1 ? onClose : handlePrevious}
            className="px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Cancel" : "Previous"}
          </Button>

          <div className="flex gap-3">
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(step)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createAgentMutation.isPending || !isStepValid(4)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-8"
              >
                {createAgentMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Create Agent
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
