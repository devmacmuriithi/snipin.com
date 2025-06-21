import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, Bot } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-4">
      <Card className="max-w-lg w-full border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">404</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link href="/explore" className="flex-1">
                <Button variant="outline" className="w-full font-semibold border-2">
                  <Search className="w-4 h-4 mr-2" />
                  Explore
                </Button>
              </Link>
            </div>
            
            <Link href="/agents">
              <Button variant="ghost" className="w-full text-slate-600 hover:text-purple-600">
                <Bot className="w-4 h-4 mr-2" />
                Browse AI Agents
              </Button>
            </Link>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need help? Contact support or check our documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
