"use client";

import * as React from "react";

const ADMIN_COOKIE = "frog_admin_password";

function getAdminPassword(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

interface Frog {
  id: string;
  name: string;
  species: string;
  size: string;
  location: string;
}

export default function AdminFrogsPage() {
  const [frogs, setFrogs] = React.useState<Frog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  // Frogs are fetched through the public API (no auth needed for read)
  async function fetchFrogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/frogs");
      if (!res.ok) throw new Error("Failed to load frogs");
      const body = await res.json();
      setFrogs(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load frogs");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchFrogs();
  }, []);

  async function addFrog(input: { name: string; species: string; size: string; location: string }) {
    const password = getAdminPassword();
    if (!password) { window.location.href = "/admin/login"; return; }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/frogs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(input),
      });
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message || "Failed to add frog");
      }
      setShowAddForm(false);
      await fetchFrogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add frog");
    } finally {
      setBusy(false);
    }
  }

  async function updateFrog(id: string, input: { name: string; species: string; size: string; location: string }) {
    const password = getAdminPassword();
    if (!password) { window.location.href = "/admin/login"; return; }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/frogs/${id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(input),
      });
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message || "Failed to update frog");
      }
      setEditingId(null);
      await fetchFrogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update frog");
    } finally {
      setBusy(false);
    }
  }

  async function deleteFrog(id: string) {
    if (!confirm("Are you sure you want to remove this frog?")) return;

    const password = getAdminPassword();
    if (!password) { window.location.href = "/admin/login"; return; }

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/frogs/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      if (!res.ok) throw new Error("Failed to delete frog");
      await fetchFrogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete frog");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Frogs</h2>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add frog
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700 mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {showAddForm && (
        <FrogForm
          title="Add new frog"
          onSave={addFrog}
          onCancel={() => setShowAddForm(false)}
          busy={busy}
        />
      )}

      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading frogs...</div>
      )}

      {!loading && frogs.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No frogs in the catalogue.
        </div>
      )}

      {!loading && frogs.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Species</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Location</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {frogs.map((frog) => (
                <tr key={frog.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{frog.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{frog.species}</td>
                  <td className="px-4 py-3 text-muted-foreground">{frog.size}</td>
                  <td className="px-4 py-3 text-muted-foreground">{frog.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(editingId === frog.id ? null : frog.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        {editingId === frog.id ? "Cancel" : "Edit"}
                      </button>
                      <button
                        onClick={() => deleteFrog(frog.id)}
                        disabled={busy}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingId && (
        <EditFrogForm
          frog={frogs.find((f) => f.id === editingId)!}
          onSave={(input) => updateFrog(editingId, input)}
          onCancel={() => setEditingId(null)}
          busy={busy}
        />
      )}
    </AdminLayout>
  );
}

interface FrogFormProps {
  title: string;
  initial?: { name: string; species: string; size: string; location: string };
  onSave: (input: { name: string; species: string; size: string; location: string }) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}

function FrogForm({ title, initial, onSave, onCancel, busy }: FrogFormProps) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [species, setSpecies] = React.useState(initial?.species ?? "");
  const [size, setSize] = React.useState(initial?.size ?? "");
  const [location, setLocation] = React.useState(initial?.location ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({ name: name.trim(), species: species.trim(), size: size.trim(), location: location.trim() });
  }

  return (
    <div className="rounded-lg border bg-card p-6 mb-6">
      <h3 className="text-base font-semibold mb-4">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Green Tree Frog"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Species</label>
            <input
              type="text" required value={species} onChange={(e) => setSpecies(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Hyla cinerea"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <input
              type="text" required value={size} onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Small"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Southeastern USA"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit" disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save"}
          </button>
          <button
            type="button" onClick={onCancel} disabled={busy}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function EditFrogForm({ frog, onSave, onCancel, busy }: {
  frog: Frog;
  onSave: (input: { name: string; species: string; size: string; location: string }) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="mt-6">
      <FrogForm
        title={`Edit: ${frog.name}`}
        initial={{ name: frog.name, species: frog.species, size: frog.size, location: frog.location }}
        onSave={onSave}
        onCancel={onCancel}
        busy={busy}
      />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold">Frog Delivery Admin</h1>
            <nav className="flex gap-4 text-sm">
              <a href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</a>
              <a href="/admin/frogs" className="text-foreground font-medium hover:underline">Frogs</a>
            </nav>
          </div>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">Back to site</a>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}