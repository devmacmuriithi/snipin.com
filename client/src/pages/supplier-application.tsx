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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Package, Award, Globe, FileText } from "lucide-react";

const supplierApplicationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  companyDescription: z.string().min(50, "Please provide a detailed company description (minimum 50 characters)"),
  serviceCategory: z.string().min(1, "Please select a service category"),
  specificServices: z.string().min(20, "Please describe your specific services (minimum 20 characters)"),
  experience: z.string().min(1, "Please select your experience level"),
  clientReferences: z.string().optional(),
  certifications: z.string().optional(),
  pricing: z.string().min(1, "Please select a pricing structure"),
  availability: z.string().min(1, "Please select your availability"),
  portfolio: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions")
});

type SupplierApplicationForm = z.infer<typeof supplierApplicationSchema>;

export default function SupplierApplication() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set page-specific meta tags for social sharing
  useEffect(() => {
    // Update page title
    document.title = "Supplier Application - SnipIn | Join Our AI Service Partner Network";
    
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
    updateMetaTag('description', 'Join SnipIn as a service provider and expand your business reach. Apply to become part of our AI-powered ecosystem and connect with innovative ventures seeking your expertise.');
    
    // Open Graph tags
    updateMetaTag('og:title', 'Supplier Application - Join Our AI Service Partner Network');
    updateMetaTag('og:description', 'Join SnipIn as a service provider and expand your business reach. Apply to become part of our AI-powered ecosystem and connect with innovative ventures seeking your expertise.');
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Supplier Application - Join Our AI Service Partner Network');
    updateMetaTag('twitter:description', 'Join SnipIn as a service provider and expand your business reach. Apply to become part of our AI-powered ecosystem and connect with innovative ventures seeking your expertise.');
    
    return () => {
      // Reset to default title when component unmounts
      document.title = "SnipIn - AI Social Media Platform";
    };
  }, []);

  const form = useForm<SupplierApplicationForm>({
    resolver: zodResolver(supplierApplicationSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      companyDescription: "",
      serviceCategory: "",
      specificServices: "",
      experience: "",
      clientReferences: "",
      certifications: "",
      pricing: "",
      availability: "",
      portfolio: "",
      termsAccepted: false
    }
  });

  const onSubmit = async (data: SupplierApplicationForm) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application Submitted Successfully",
        description: "We'll review your supplier application and get back to you within 3-5 business days.",
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
            <Package className="w-4 h-4 mr-2" />
            Supplier Application
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Join Our Service Partner Network
          </h1>
          <p className="text-muted-foreground text-lg">
            Become a trusted service provider in our AI-powered ecosystem and connect with innovative ventures.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Application Form</CardTitle>
            <CardDescription>
              Tell us about your company and services. Join our network of trusted partners serving innovative ventures.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
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
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourcompany.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="companyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your company, mission, and core competencies..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Contact Name *</FormLabel>
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
                          <FormLabel>Business Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@yourcompany.com" {...field} />
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
                        <FormLabel>Business Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Service Details
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="serviceCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Service Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="consulting">Business Consulting</SelectItem>
                            <SelectItem value="technology">Technology Development</SelectItem>
                            <SelectItem value="marketing">Marketing & Growth</SelectItem>
                            <SelectItem value="design">Design & UX</SelectItem>
                            <SelectItem value="legal">Legal Services</SelectItem>
                            <SelectItem value="finance">Financial Services</SelectItem>
                            <SelectItem value="operations">Operations & Logistics</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specificServices"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specific Services Offered *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detail the specific services you provide and your areas of expertise..."
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
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-3">1-3 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="5-10">5-10 years</SelectItem>
                              <SelectItem value="10-15">10-15 years</SelectItem>
                              <SelectItem value="15+">15+ years</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pricing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Structure *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pricing model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly Rate</SelectItem>
                              <SelectItem value="project">Project-Based</SelectItem>
                              <SelectItem value="retainer">Monthly Retainer</SelectItem>
                              <SelectItem value="value">Value-Based</SelectItem>
                              <SelectItem value="mixed">Mixed Approach</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Availability *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediate">Available Immediately</SelectItem>
                            <SelectItem value="1-2-weeks">Available in 1-2 weeks</SelectItem>
                            <SelectItem value="1-month">Available in 1 month</SelectItem>
                            <SelectItem value="2-3-months">Available in 2-3 months</SelectItem>
                            <SelectItem value="limited">Limited Availability</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Credentials & Portfolio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Credentials & Portfolio
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications & Qualifications</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List any relevant certifications, degrees, or professional qualifications..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientReferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client References</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide 2-3 client references with contact information (optional but recommended)..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio/Case Studies</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your best work examples or provide links to case studies..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the terms and conditions for service providers *
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            By checking this box, you agree to our supplier terms, quality standards, and partnership guidelines.
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      Submit Supplier Application
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