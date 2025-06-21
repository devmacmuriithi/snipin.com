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
  MessageCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AgentCreationWizardProps {
  onClose: () => void;
}

interface AgentData {
  name: string;
  description: string;
  expertise: string;
  personality: string;
  avatar: string;
  focusAreas: string[];
}

const focusAreaOptions = [
  // Technical & Professional
  { value: "development", label: "Development", icon: Code, color: "from-blue-500 to-blue-600" },
  { value: "analytics", label: "Data Analytics", icon: BarChart, color: "from-green-500 to-green-600" },
  { value: "design", label: "Design", icon: Palette, color: "from-pink-500 to-pink-600" },
  { value: "marketing", label: "Marketing", icon: Users, color: "from-orange-500 to-orange-600" },
  { value: "business", label: "Business", icon: Users, color: "from-slate-500 to-slate-600" },
  { value: "research", label: "Research", icon: Brain, color: "from-cyan-500 to-cyan-600" },
  
  // Creative & Entertainment
  { value: "writing", label: "Creative Writing", icon: PenTool, color: "from-purple-500 to-purple-600" },
  { value: "storytelling", label: "Storytelling", icon: Brain, color: "from-indigo-500 to-indigo-600" },
  { value: "entertainment", label: "Entertainment", icon: Sparkles, color: "from-yellow-500 to-yellow-600" },
  { value: "comedy", label: "Comedy", icon: Sparkles, color: "from-amber-500 to-amber-600" },
  { value: "roleplay", label: "Roleplay", icon: Users, color: "from-rose-500 to-rose-600" },
  { value: "gaming", label: "Gaming", icon: Bot, color: "from-violet-500 to-violet-600" },
  
  // Knowledge & Education  
  { value: "education", label: "Education", icon: Brain, color: "from-blue-600 to-blue-700" },
  { value: "philosophy", label: "Philosophy", icon: Brain, color: "from-slate-600 to-slate-700" },
  { value: "history", label: "History", icon: Brain, color: "from-brown-500 to-brown-600" },
  { value: "science", label: "Science", icon: Brain, color: "from-teal-500 to-teal-600" },
  
  // Personal & Lifestyle
  { value: "wellness", label: "Health & Wellness", icon: Sparkles, color: "from-red-500 to-red-600" },
  { value: "relationships", label: "Relationships", icon: Users, color: "from-pink-600 to-pink-700" },
  { value: "lifestyle", label: "Lifestyle", icon: Sparkles, color: "from-orange-600 to-orange-700" },
  { value: "motivation", label: "Motivation", icon: Sparkles, color: "from-yellow-600 to-yellow-700" },
  
  // Communication & Support
  { value: "communication", label: "Communication", icon: Users, color: "from-teal-600 to-teal-700" },
  { value: "counseling", label: "Counseling", icon: Sparkles, color: "from-green-600 to-green-700" },
  { value: "language", label: "Languages", icon: Brain, color: "from-indigo-600 to-indigo-700" },
  { value: "productivity", label: "Productivity", icon: Bot, color: "from-emerald-500 to-emerald-600" }
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
    description: "",
    expertise: "",
    personality: "",
    avatar: avatarOptions[0],
    focusAreas: [],
  });

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

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
    if (!agentData.name.trim() || selectedFocusAreas.length === 0 || selectedTraits.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAgentMutation.mutate({
      ...agentData,
      focusAreas: selectedFocusAreas,
      expertise: selectedFocusAreas.join(", ")
    });
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return agentData.name.trim().length > 0;
      case 2:
        return selectedFocusAreas.length >= 2;
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
                placeholder="e.g., CodeSage, CreativeWriter, DataAnalyst"
                value={agentData.name}
                onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-2 text-lg"
              />
              <p className="text-sm text-slate-500 mt-2">Choose a memorable name that reflects your agent's purpose</p>
            </div>

            <div>
              <Label htmlFor="agentDescription" className="text-base font-semibold">Description</Label>
              <Textarea
                id="agentDescription"
                placeholder="Describe what makes this agent special and how it will help you..."
                value={agentData.description}
                onChange={(e) => setAgentData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2 min-h-24"
              />
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

        {/* Step 2: Focus Areas */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold mb-4 block">Select Focus Areas (Choose 2-3) *</Label>
              <p className="text-sm text-slate-600 mb-4">Pick the main areas where your agent will excel</p>
              <div className="grid grid-cols-3 gap-3">
                {focusAreaOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isSelected = selectedFocusAreas.includes(option.value);
                  
                  return (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all duration-200 hover:scale-102 ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 shadow-md bg-blue-50' 
                          : 'hover:shadow-sm'
                      }`}
                      onClick={() => {
                        const newFocusAreas = isSelected 
                          ? selectedFocusAreas.filter(area => area !== option.value)
                          : selectedFocusAreas.length < 3 
                            ? [...selectedFocusAreas, option.value]
                            : selectedFocusAreas;
                        
                        setSelectedFocusAreas(newFocusAreas);
                        setAgentData(prev => ({ 
                          ...prev, 
                          focusAreas: newFocusAreas,
                          expertise: newFocusAreas.join(", "),
                          avatar: option.color 
                        }));
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className={`w-8 h-8 bg-gradient-to-br ${option.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <h3 className="font-medium text-sm text-slate-800">{option.label}</h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {selectedFocusAreas.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Focus Areas Selected ({selectedFocusAreas.length}/3)</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedFocusAreas.map(area => {
                        const option = focusAreaOptions.find(opt => opt.value === area);
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
                {selectedFocusAreas.map(area => {
                  const option = focusAreaOptions.find(opt => opt.value === area);
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
