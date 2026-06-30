"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setErrorMsg("Invalid email or password. Please try again.");
        setLoading(false);
      } else {
        // Successful login, let NextAuth middleware handle redirecting to /admin or /user
        router.refresh();
        router.push("/");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-warm-cream py-16 px-6">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border border-cream-dark bg-white animate-scaleUp">
        
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="w-12 h-12 bg-logo-gold rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="text-sm font-bold text-text-dark font-serif">YL</span>
          </div>
          <CardTitle className="font-serif text-3xl font-bold text-deep-teal">Welcome Back</CardTitle>
          <CardDescription className="text-sm text-text-muted">
            Log in to the Yog Love Yoga Lecture Tracker
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-4 rounded-lg mb-6 text-sm flex items-center gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-red-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
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
                placeholder="email@example.com"
                disabled={loading}
                className="pt-2 pb-3"
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
                placeholder="••••••••"
                disabled={loading}
                className="pt-2 pb-3"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                fullWidth
                size="lg"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </div>

          </form>
        </CardContent>

      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-warm-cream py-16 px-6">
        <div className="text-deep-teal font-serif text-lg font-semibold animate-pulse">Loading login credentials...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

