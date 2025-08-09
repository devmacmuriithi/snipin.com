import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Building, Users, DollarSign } from "lucide-react";

const consultingApplicationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.string().min(1, "Please select company size"),
  fundingStage: z.string().min(1, "Please select funding stage"),
  currentChallenges: z.string().min(20, "Please describe your challenges (minimum 20 characters)"),
  expectedOutcomes: z.string().min(20, "Please describe expected outcomes (minimum 20 characters)"),
  timeline: z.string().min(1, "Please select a timeline"),
  budget: z.string().min(1, "Please select a budget range")
});

type ConsultingApplicationForm = z.infer<typeof consultingApplicationSchema>;

export default function ConsultingApplication() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set page-specific meta tags for social sharing
  useEffect(() => {
    // Update page title
    document.title = "Consulting Application - SnipIn | Apply for AI Business Consulting";
    
    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Page description
    updateMetaTag('description', 'Apply for AI-powered business consulting services. Get strategic guidance, growth planning, and operational optimization for your venture. Start your transformation today.');
    
    // Open Graph tags
    updateMetaTag('og:title', 'Consulting Application - Apply for AI Business Consulting');
    updateMetaTag('og:description', 'Apply for AI-powered business consulting services. Get strategic guidance, growth planning, and operational optimization for your venture. Start your transformation today.');
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Consulting Application - Apply for AI Business Consulting');
    updateMetaTag('twitter:description', 'Apply for AI-powered business consulting services. Get strategic guidance, growth planning, and operational optimization for your venture. Start your transformation today.');
    
    return () => {
      // Reset to default title when component unmounts
      document.title = "SnipIn - AI Social Media Platform";
    };
  }, []);

  const form = useForm<ConsultingApplicationForm>({
    resolver: zodResolver(consultingApplicationSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      industry: "",
      companySize: "",
      fundingStage: "",
      currentChallenges: "",
      expectedOutcomes: "",
      timeline: "",
      budget: ""
    }
  });

  const onSubmit = async (data: ConsultingApplicationForm) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Submitted Successfully",
        description: "We'll review your application and get back to you within 2 business days.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/venture-services">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </Link>
          <Badge variant="secondary" className="mb-4">
            <Building className="w-4 h-4 mr-2" />
            Consulting Application
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Apply for AI Business Consulting
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us about your venture and how we can help accelerate your growth with AI-powered solutions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consulting Application Form</CardTitle>
            <CardDescription>
              Please provide detailed information about your company and consulting needs. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Company Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="ecommerce">E-commerce</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="manufacturing">Manufacturing</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companySize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Size *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 employees</SelectItem>
                              <SelectItem value="11-50">11-50 employees</SelectItem>
                              <SelectItem value="51-200">51-200 employees</SelectItem>
                              <SelectItem value="201-500">201-500 employees</SelectItem>
                              <SelectItem value="500+">500+ employees</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fundingStage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Stage *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select funding stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                              <SelectItem value="seed">Seed</SelectItem>
                              <SelectItem value="series-a">Series A</SelectItem>
                              <SelectItem value="series-b">Series B</SelectItem>
                              <SelectItem value="series-c">Series C+</SelectItem>
                              <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Details</h3>
                  
                  <FormField
                    control={form.control}
                    name="currentChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Challenges *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the main challenges your company is facing..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expectedOutcomes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Outcomes *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What outcomes are you hoping to achieve through consulting?"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="timeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Timeline *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-3-months">1-3 months</SelectItem>
                              <SelectItem value="3-6-months">3-6 months</SelectItem>
                              <SelectItem value="6-12-months">6-12 months</SelectItem>
                              <SelectItem value="12-months+">12+ months</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="10k-25k">$10k - $25k</SelectItem>
                              <SelectItem value="25k-50k">$25k - $50k</SelectItem>
                              <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                              <SelectItem value="100k-250k">$100k - $250k</SelectItem>
                              <SelectItem value="250k+">$250k+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting Application..."
                  ) : (
                    <>
                      Submit Application
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}