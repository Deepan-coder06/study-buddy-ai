import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, Github } from 'lucide-react';
import GoogleIcon from '../icons/GoogleIcon';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";

import { auth, googleProvider, githubProvider } from "@/firebase";

const AuthScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState<boolean | string>(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(isRegister ? 'register' : 'login');
    setError("");

    if (!email || !password || (isRegister && !name)) {
        setError("Please fill in all fields.");
        setIsLoading(false);
        return;
    }

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // No need to call onLogin, Firebase auth state change is handled by App.tsx
    } catch (err: any) {
      let message = "Authentication failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered. Please sign in.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        message = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/weak-password") {
        message = "Password is too weak. Must be at least 6 characters.";
      }
      setError(message);
      console.error("Firebase Auth Error:", err.code, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "Google" | "Github") => {
    setIsLoading(provider);
    setError("");

    try {
      const authProvider = provider === "Google" ? googleProvider : githubProvider;
      await signInWithPopup(auth, authProvider);
      // No need to call onLogin, Firebase auth state change is handled by App.tsx
    } catch (err: any) {
      let message = "Social login failed. Please try again.";
      if (err.code === 'auth/account-exists-with-different-credential') {
        message = "An account already exists with this email address. Please sign in with your original method.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = "Login process was cancelled."; // Don't show as an error
        setError("");
      } else {
        setError(message);
      }
      console.error("Social Login Error:", err.code, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />

      <div className="glass-card p-8 w-full max-w-md z-10 animate-scale-in">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">StudentLife</span>
            <span className="font-light">OS</span>
          </h1>
          <p className="text-muted-foreground">Your AI Guardian for Health & Success</p>
        </div>

        {error && (
            <div className="bg-destructive/20 text-destructive text-sm p-3 rounded-lg mb-4 text-center animate-shake">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="student@university.edu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-muted-foreground" size={20} />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!!isLoading}
            className="w-full bg-gradient-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg glow-effect transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading === (isRegister ? 'register' : 'login') ? <Loader2 className="animate-spin" /> : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-border flex-1" />
          <span className="text-muted-foreground text-xs uppercase font-medium">Or continue with</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            type="button"
            onClick={() => handleSocialLogin("Google")}
            disabled={!!isLoading}
            className="flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold py-2.5 rounded-xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading === 'Google' ? <Loader2 className="animate-spin"/> : <><GoogleIcon className="w-5 h-5" /> Google</>}
          </button>
          <button 
            type="button"
            onClick={() => handleSocialLogin("Github")}
            disabled={!!isLoading}
            className="flex items-center justify-center gap-2 bg-[#24292F] text-white font-semibold py-2.5 rounded-xl hover:bg-[#24292F]/90 transition-all active:scale-95 disabled:opacity-50"
          >
             {isLoading === 'Github' ? <Loader2 className="animate-spin"/> : <><Github size={20} /> Github</>}
          </button>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="ml-2 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              {isRegister ? 'Sign In' : 'Register Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
