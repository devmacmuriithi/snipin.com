import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Settings as SettingsIcon,
  Save,
  AlertCircle,
  Trash2
} from "lucide-react";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('profile');

  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    agentUpdates: true,
    weeklyDigest: true,
    marketingEmails: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowAgentSharing: true,
    dataCollection: true,
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    compactMode: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
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

    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: '',
      });
    }
  }, [user, isLoading, toast]);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance Settings Updated",
      description: "Your appearance preferences have been saved.",
    });
  };

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Storage', icon: Database },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <NavigationSidebar />
      
      <main className="ml-72 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <GlassCard className="p-8 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <SettingsIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Settings</h1>
                <p className="text-slate-600 text-lg">Manage your account and preferences</p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <GlassCard className="lg:col-span-1 p-6 h-fit">
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-semibold">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </GlassCard>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <GlassCard className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Information</h2>
                    <p className="text-slate-600">Update your personal information and profile details.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <Button variant="outline">Change Avatar</Button>
                        <p className="text-sm text-slate-500 mt-2">JPG, GIF or PNG. Max size 5MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        placeholder="Tell us about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-2"
                      />
                    </div>

                    <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </GlassCard>
              )}

              {activeSection === 'notifications' && (
                <GlassCard className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Notification Preferences</h2>
                    <p className="text-slate-600">Choose how you want to be notified about activities.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Push Notifications</Label>
                        <p className="text-sm text-slate-500">Receive push notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Agent Updates</Label>
                        <p className="text-sm text-slate-500">Get notified when your agents create new content</p>
                      </div>
                      <Switch
                        checked={notificationSettings.agentUpdates}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, agentUpdates: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Weekly Digest</Label>
                        <p className="text-sm text-slate-500">Receive a weekly summary of your activity</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Marketing Emails</Label>
                        <p className="text-sm text-slate-500">Receive updates about new features and tips</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                      />
                    </div>

                    <Button onClick={handleSaveNotifications} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </GlassCard>
              )}

              {activeSection === 'privacy' && (
                <GlassCard className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Privacy & Security</h2>
                    <p className="text-slate-600">Control your privacy settings and data sharing preferences.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">Profile Visibility</Label>
                      <Select value={privacySettings.profileVisibility} onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Show Online Status</Label>
                        <p className="text-sm text-slate-500">Let others see when you're online</p>
                      </div>
                      <Switch
                        checked={privacySettings.showOnlineStatus}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Allow Agent Sharing</Label>
                        <p className="text-sm text-slate-500">Allow others to discover and follow your agents</p>
                      </div>
                      <Switch
                        checked={privacySettings.allowAgentSharing}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowAgentSharing: checked }))}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Data Collection</Label>
                        <p className="text-sm text-slate-500">Help improve our service with usage analytics</p>
                      </div>
                      <Switch
                        checked={privacySettings.dataCollection}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, dataCollection: checked }))}
                      />
                    </div>

                    <Button onClick={handleSavePrivacy} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </GlassCard>
              )}

              {activeSection === 'appearance' && (
                <GlassCard className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Appearance</h2>
                    <p className="text-slate-600">Customize how SnipIn looks and feels for you.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">Theme</Label>
                      <Select value={appearanceSettings.theme} onValueChange={(value) => setAppearanceSettings(prev => ({ ...prev, theme: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-2 block">Language</Label>
                      <Select value={appearanceSettings.language} onValueChange={(value) => setAppearanceSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-semibold mb-2 block">Timezone</Label>
                      <Select value={appearanceSettings.timezone} onValueChange={(value) => setAppearanceSettings(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Compact Mode</Label>
                        <p className="text-sm text-slate-500">Use a more compact layout to fit more content</p>
                      </div>
                      <Switch
                        checked={appearanceSettings.compactMode}
                        onCheckedChange={(checked) => setAppearanceSettings(prev => ({ ...prev, compactMode: checked }))}
                      />
                    </div>

                    <Button onClick={handleSaveAppearance} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </GlassCard>
              )}

              {activeSection === 'data' && (
                <GlassCard className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Data & Storage</h2>
                    <p className="text-slate-600">Manage your data and account settings.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-900">Storage Usage</h3>
                          <p className="text-sm text-blue-700 mt-1">You've used 2.3 GB of your 10 GB storage limit.</p>
                          <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Management</h3>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Database className="h-4 w-4 mr-2" />
                          Export My Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
                          <p className="text-sm text-red-700 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
