"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addCustomer } from "@/actions/customer";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid email or password. Please try again.");
    } else if (errorParam) {
      setErrorMsg("An error occurred during authentication.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        // 1. Log In Flow
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        if (res?.error) {
          setErrorMsg("Invalid email or password. Please try again.");
          setLoading(false);
        } else {
          router.refresh();
          router.push("/");
        }
      } else {
        // 2. Create Account Flow
        const regRes = await addCustomer({
          name,
          email,
          password,
          timezone: "UTC",
          country: "India"
        });

        if (!regRes.success) {
          setErrorMsg(regRes.error || "Failed to create account.");
          setLoading(false);
        } else {
          setSuccessMsg("Account successfully registered! Logging in...");
          
          // Sign in automatically after registration
          const signRes = await signIn("credentials", {
            email,
            password,
            redirect: false
          });

          if (signRes?.error) {
            setErrorMsg("Account created, but automatic login failed. Please sign in manually.");
            setMode("login");
            setLoading(false);
          } else {
            router.refresh();
            router.push("/");
          }
        }
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMsg("");
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-warm-cream py-16 px-6">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border border-cream-dark bg-white animate-scaleUp">
        
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="w-12 h-12 bg-logo-gold rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="text-sm font-bold text-text-dark font-serif">PS</span>
          </div>
          <CardTitle className="font-serif text-3xl font-bold text-deep-teal">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-sm text-text-muted">
            {mode === "login" ? "Log in to your Pranexa Studio Portal" : "Sign up for online yoga and private coaching"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-4 rounded-lg text-sm flex items-center gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-red-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-800 border border-green-200/50 p-4 rounded-lg text-sm flex items-center gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-green-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {successMsg}
            </div>
          )}

          {/* 1. Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-cream-dark hover:bg-warm-cream/35 py-3 rounded-full text-sm font-semibold text-text-dark transition-colors bg-white shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-cream-dark/60"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-text-muted uppercase tracking-wider">or continue with email</span>
            <div className="flex-grow border-t border-cream-dark/60"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === "register" && (
              <div className="space-y-1">
                <label htmlFor="reg-name" className="text-xs uppercase font-bold tracking-wider text-text-muted">
                  Full Name
                </label>
                <Input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="login-email" className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Email Address
              </label>
              <Input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="login-password" className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth className="mt-2">
              {loading ? (mode === "login" ? "Logging in..." : "Registering...") : (mode === "login" ? "Log In" : "Create Account")}
            </Button>
          </form>

          {/* Toggle Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-xs font-semibold text-deep-teal hover:underline"
            >
              {mode === "login" 
                ? "Don't have an account? Create Account" 
                : "Already have an account? Log In"
              }
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-warm-cream py-16 px-6">
        <p className="text-sm text-text-muted">Loading authentication parameters...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
