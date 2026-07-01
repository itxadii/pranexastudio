"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { verifyUserRole } from "@/actions/auth";

function TrainerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid trainer email or password.");
    } else if (errorParam) {
      setErrorMsg("An authentication error occurred.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Check that the user is a Trainer first
      const checkRoleRes = await verifyUserRole(email, "TRAINER");
      if (!checkRoleRes.success) {
        setErrorMsg(checkRoleRes.error || "Access Denied.");
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (res?.error) {
        setErrorMsg("Invalid trainer credentials.");
        setLoading(false);
      } else {
        router.refresh();
        router.push("/trainer");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-warm-cream py-24 px-6 min-h-screen">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-cream-dark bg-white animate-scaleUp">
        
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="w-12 h-12 bg-deep-teal/10 rounded-full border border-deep-teal/20 flex items-center justify-center mx-auto shadow-sm">
            <span className="text-sm font-bold text-deep-teal font-serif">PS</span>
          </div>
          <CardTitle className="font-serif text-2xl font-bold text-deep-teal">
            Pranexa Studio
          </CardTitle>
          <CardDescription className="text-xs text-text-muted">
            Yoga Trainer & Instructor Portal
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {errorMsg && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-4 rounded-lg text-xs flex items-center gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-red-600 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="trainer-email" className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Trainer Email
              </label>
              <Input
                id="trainer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trainer@pranexastudio.com"
                className="bg-transparent border-cream-dark text-text-dark placeholder:text-text-muted/65 focus:border-deep-teal focus:ring-deep-teal"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="trainer-password" className="text-xs uppercase font-bold tracking-wider text-text-muted">
                Password
              </label>
              <Input
                id="trainer-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-cream-dark text-text-dark placeholder:text-text-muted/65 focus:border-deep-teal focus:ring-deep-teal"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth className="mt-2 bg-deep-teal text-white hover:bg-deep-teal/95 font-bold transition-colors">
              {loading ? "Verifying..." : "Log In as Trainer"}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default function TrainerLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-warm-cream py-16 px-6 min-h-screen text-text-muted text-xs">
        Loading trainer login portal...
      </div>
    }>
      <TrainerLoginForm />
    </Suspense>
  );
}
