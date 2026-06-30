"use client";

import React, { useState } from "react";
import { changeOwnPassword } from "@/actions/settings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await changeOwnPassword(currentPassword, newPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to change password.");
    } else {
      setSuccessMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="font-serif text-3xl font-bold text-deep-teal">Account Settings</h2>
        <p className="text-text-muted text-sm mt-0.5">Manage your administrator account security settings.</p>
      </div>

      <div className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Change Security Password</CardTitle>
            <CardDescription>Update your login credentials below. Keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            
            {errorMsg && (
              <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold mb-4">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 text-green-700 border border-green-200/50 p-3 rounded-lg text-sm font-semibold mb-4">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Current Password</label>
                <Input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold tracking-wider text-text-muted">New Password</label>
                <Input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Confirm New Password</label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
