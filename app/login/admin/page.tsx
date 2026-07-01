"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { verifyUserRole } from "@/actions/auth";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setErrorMsg("Invalid administrator email or password.");
    } else if (errorParam) {
      setErrorMsg("An authentication error occurred.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Check that the user is an Administrator first
      const checkRoleRes = await verifyUserRole(email, "ADMIN");
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
        setErrorMsg("Invalid administrator credentials.");
        setLoading(false);
      } else {
        router.refresh();
        router.push("/admin");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-950 py-24 px-6 min-h-screen">
      <div className="w-full max-w-md shadow-2xl rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 p-8 space-y-6 animate-scaleUp">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-logo-gold/20 rounded-full border border-logo-gold/30 flex items-center justify-center mx-auto shadow-sm">
            <span className="text-sm font-bold text-logo-gold font-serif">PS</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-logo-gold">
            Pranexa Studio
          </h1>
          <p className="text-xs text-slate-400">
            Administrative Management Terminal
          </p>
        </div>

        <div className="space-y-6">
          {errorMsg && (
            <div className="bg-red-950/40 text-red-400 border border-red-900/50 p-4 rounded-lg text-xs flex items-center gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-red-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-email" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Admin Email
              </label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pranexastudio.com"
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-logo-gold focus:ring-logo-gold"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-password" className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-logo-gold focus:ring-logo-gold"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth className="mt-2 bg-logo-gold text-slate-950 hover:bg-logo-gold/90 font-bold border-none transition-colors">
              {loading ? "Authorizing..." : "Authenticate Access"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-slate-950 py-16 px-6 min-h-screen text-slate-400 text-xs">
        Loading admin login terminal...
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
