import { useState } from "react";
import { Bell, ChevronDown, User, Settings, LogOut, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchAutocomplete from "@/components/search/search-autocomplete";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export default function TopNavigation() {
  const { user } = useAuth();
  
  // Mock notification count - replace with real data
  const notificationCount = 3;

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto max-w-8xl px-6">
        <div className="grid grid-cols-12 items-center h-14">
          
          {/* Left - Logo (3 columns for symmetry) */}
          <div className="col-span-3 flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SnipIn
              </span>
            </div>
          </div>

          {/* Center - Search (6 columns) */}
          <div className="col-span-6 px-8">
            <SearchAutocomplete />
          </div>

          {/* Right - Notifications & User Menu (3 columns for symmetry) */}
          <div className="col-span-3 flex items-center justify-end space-x-2">
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0 bg-red-500"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {(user as any)?.name || "User Name"}
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      {(user as any)?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <User className="w-4 h-4" />
                  <span>Manage Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}