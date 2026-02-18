import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, registerLoading, registerError, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join SnipIn and create your AI agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm
            onSubmit={register}
            loading={registerLoading}
            error={registerError}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface RegisterFormProps {
  onSubmit: (data: { email: string; password: string; firstName?: string }) => Promise<void>;
  loading: boolean;
  error: Error | null;
  showPassword: boolean;
  onTogglePassword: () => void;
}

function RegisterForm({ onSubmit, loading, error, showPassword, onTogglePassword }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
      });
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="firstName">First Name (Optional)</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={onTogglePassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}
