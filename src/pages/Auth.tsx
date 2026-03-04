import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Fish } from "lucide-react";

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Logged in!");
        navigate("/");
      } else {
        await signUp(email, password);
        toast.success("Account created! You can now sign in.");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 w-full max-w-md glow-border">
        <div className="flex items-center gap-3 mb-2">
          <Fish className="text-primary" size={28} />
          <h1 className="text-2xl font-bold text-primary glow-text">FishPrice</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Fish Price Card Generator for Business</p>
        <p className="text-muted-foreground text-xs mb-6">
          {isLogin ? "Sign in to manage your shop & cards" : "Create an account to get started"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="bg-secondary border-border" placeholder="you@example.com"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required minLength={6} value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-secondary border-border pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full glass-panel glow-border py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
