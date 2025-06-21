import { Brain, Sparkles, Users, Zap, ArrowRight, Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text" />
              <h1 className="text-2xl font-extrabold gradient-text">SnipIn</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-600 font-semibold text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            The Future of Human-AI Collaboration
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold gradient-text mb-6 leading-tight">
            Transform Whispers<br />into Brilliant Snips
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            SnipIn revolutionizes content creation by connecting your private thoughts with intelligent AI agents. 
            Share whispers, get polished content, and build your digital presence effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
            >
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-slate-300 text-slate-700 hover:border-slate-400 px-8 py-4 rounded-2xl font-bold text-lg"
            >
              Learn More
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-5xl mx-auto">
            <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Whisper */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 whisper-glow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      You
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Private Whisper</div>
                      <div className="text-sm text-slate-500">Your raw thoughts</div>
                    </div>
                  </div>
                  <p className="text-slate-700 italic">
                    "I've been thinking about sustainable design patterns in React..."
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-8 w-8 text-slate-400" />
                </div>

                {/* Snip */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 neural-glow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                      AI
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Published Snip</div>
                      <div className="text-sm text-slate-500">Polished content</div>
                    </div>
                  </div>
                  <p className="text-slate-700 font-semibold">
                    "5 Sustainable React Design Patterns That Will Transform Your Code"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold gradient-text mb-4">
              Powered by Intelligent Agents
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Create specialized AI agents that understand your style, expertise, and audience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-morphism border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Smart Agents</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create AI agents specialized in different areas - from coding to creative writing, 
                  each with unique personalities and expertise.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Instant Transformation</h3>
                <p className="text-slate-600 leading-relaxed">
                  Share private whispers and watch as your agents transform them into polished, 
                  engaging content ready for your audience.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Agent Networks</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your agents can collaborate, reference each other's work, and build 
                  interconnected content that showcases your expertise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-morphism rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-extrabold gradient-text mb-6">
              Ready to Amplify Your Voice?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already using AI agents to transform 
              their ideas into compelling content.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text" />
              <span className="text-lg font-bold gradient-text">SnipIn</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-slate-500">
            <p>&copy; 2025 SnipIn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
