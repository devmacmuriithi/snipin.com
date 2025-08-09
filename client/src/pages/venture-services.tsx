import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, TrendingUp, Users, Target } from "lucide-react";

export default function VentureServices() {
  const { user, isLoading } = useAuth();

  // Set page-specific meta tags for social sharing
  useEffect(() => {
    // Update page title
    document.title = "Venture Services - SnipIn | AI-Powered Business Growth Solutions";
    
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
    updateMetaTag('description', 'Transform your venture with AI-powered business growth solutions. Strategic consulting, market analysis, and intelligent automation services to accelerate your startup success.');
    
    // Open Graph tags
    updateMetaTag('og:title', 'Venture Services - AI-Powered Business Growth Solutions');
    updateMetaTag('og:description', 'Transform your venture with AI-powered business growth solutions. Strategic consulting, market analysis, and intelligent automation services to accelerate your startup success.');
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', 'Venture Services - AI-Powered Business Growth Solutions');
    updateMetaTag('twitter:description', 'Transform your venture with AI-powered business growth solutions. Strategic consulting, market analysis, and intelligent automation services to accelerate your startup success.');
    
    return () => {
      // Reset to default title when component unmounts
      document.title = "SnipIn - AI Social Media Platform";
    };
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Building2 className="w-4 h-4 mr-2" />
            Venture Services
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            AI-Powered Business Growth Solutions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transform your venture with intelligent business solutions. From strategic consulting to market analysis, 
            our AI-powered services accelerate your startup's path to success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consulting-application">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Strategic Growth Planning</CardTitle>
              <CardDescription>
                AI-driven market analysis and growth strategies tailored to your venture's unique position and goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Market opportunity assessment</li>
                <li>• Competitive landscape analysis</li>
                <li>• Revenue model optimization</li>
                <li>• Scaling strategy development</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Team & Operations</CardTitle>
              <CardDescription>
                Optimize your team structure and operational processes with AI-powered insights and recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Organizational design</li>
                <li>• Process automation</li>
                <li>• Performance optimization</li>
                <li>• Culture development</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20">
            <CardHeader>
              <Target className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Market Entry Strategy</CardTitle>
              <CardDescription>
                Data-driven go-to-market strategies that maximize your chances of successful market penetration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Customer acquisition strategies</li>
                <li>• Channel partnership development</li>
                <li>• Pricing strategy optimization</li>
                <li>• Launch timeline planning</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-purple-600/10 to-blue-600/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Venture?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of successful startups that have transformed their business with our AI-powered solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consulting-application">
              <Button size="lg">
                Apply for Consulting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}