"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const ADMIN_COOKIE = "frog_admin_password";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function setAdminCookie(password: string) {
  document.cookie = `${ADMIN_COOKIE}=${encodeURIComponent(password)}; path=/admin; max-age=${ADMIN_COOKIE_MAX_AGE}; SameSite=Strict`;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setBusy(true);
    try {
      // Verify password by calling an admin endpoint
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": password.trim() },
      });

      if (res.status === 401) {
        setError("Incorrect password.");
        return;
      }

      if (!res.ok) {
        setError("Failed to verify credentials. Please try again.");
        return;
      }

      setAdminCookie(password.trim());
      router.push("/admin/orders");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Frog Delivery administration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Admin password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Verifying..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}