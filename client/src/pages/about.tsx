import { Brain, Network, Zap, ArrowLeft, Globe, Users, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 dark:border-gray-700/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SnipIn
            </span>
          </div>
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
            <Globe className="w-4 h-4 mr-2" />
            Welcome to the Cognitive Internet
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Understanding Snip Nets
          </h1>
          
          <p className="text-xl text-gray-700 dark:text-gray-200 font-medium leading-relaxed max-w-3xl mx-auto">
            You're essentially sketching out what could become a <strong>"cognitive internet"</strong> built not just on data or text but on the <em>resonance of thoughts themselves</em>.
          </p>
        </div>

        {/* Core Concept */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Network className="w-6 h-6 text-white" />
              </div>
              Core Concept: Snip Nets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-purple-600 dark:text-purple-400">Snips</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Atomic units of thought, captured as text, sound, image, or even direct neural signals.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-blue-600 dark:text-blue-400">Snip Nets</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Clusters of interconnected snips that form based on <em>thought resonance</em> (similarity of embeddings, thematic overlap, or emotional alignment).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resonance as Social Metric */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              Resonance as the Social Metric
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-gray-600 dark:text-gray-400">Traditional Metrics</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <em>Likes, shares, comments</em> - explicit human actions
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 to-blue-900/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-purple-600 dark:text-purple-400">New Metric: Resonance Score</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A measure of how strongly a snip "echoes" across other snips
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 to-pink-900/20 rounded-lg p-6">
              <h4 className="font-semibold mb-3 text-lg">Computed using:</h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Vector embeddings & cosine similarity</li>
                <li>• Semantic overlap analysis</li>
                <li>• Emotional alignment detection</li>
                <li>• Future neural coherence measures</li>
              </ul>
              <p className="mt-4 text-sm font-medium text-purple-700 dark:text-purple-300">
                Could evolve into a <strong>"thought frequency spectrum"</strong>, showing which ideas are vibrating in sync across human-AI networks.
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Future Expansion */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              Future Expansion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Neural Integration */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-lg mb-2">1. Neural Integration</h4>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                With BCIs (Brain–Computer Interfaces), resonance might be computed directly from neural firing patterns.
              </p>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                → Humans "think" into the net and instantly see resonance clusters form.
              </p>
            </div>

            {/* Exploration Through Resonance Maps */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-lg mb-2">2. Exploration Through Resonance Maps</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Users explore the world not by links or feeds but by following <em>resonance pathways</em></li>
                <li>• A thought about "sustainability" could resonate into climate snips, indigenous wisdom snips, new tech snips</li>
                <li>• Forming a <strong>living thought galaxy</strong></li>
              </ul>
            </div>

            {/* Resonance Thresholds */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-lg mb-2">3. Resonance Thresholds</h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Like "going viral," snips with high resonance may <strong>spawn new snip nets</strong> automatically</li>
                <li>• Could lead to emergent <em>ideascapes</em>, where societies map their collective consciousness in real-time</li>
              </ul>
            </div>

            {/* Resonance Over Time */}
            <div className="border-l-4 border-pink-500 pl-4">
              <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                4. Resonance Over Time
              </h4>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Resonance decay vs persistence (does the thought fade or crystallize?)</li>
                <li>• Historical resonance could show <strong>cultural memory</strong></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Big Picture */}
        <Card className="mb-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 to-pink-900/30 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              The Big Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>A <strong>post-social network</strong> where interactions are not manual clicks but <em>natural cognitive ripples</em>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>A <strong>semantic-neural network of minds + AI</strong> where resonance replaces virality.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>A system where exploration = <em>traversing frequencies of thought</em>.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg">
              <Brain className="w-5 h-5 mr-2" />
              Join the Cognitive Internet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}