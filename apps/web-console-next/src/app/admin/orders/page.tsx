"use client";

import * as React from "react";

const ADMIN_COOKIE = "frog_admin_password";

function getAdminPassword(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

interface Order {
  id: string;
  frogId: string;
  frogName: string;
  frogSpecies: string;
  customerName: string;
  contactInfo: string;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState<string | null>(null);

  async function fetchOrders() {
    const password = getAdminPassword();
    if (!password) {
      window.location.href = "/admin/login";
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": password },
      });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load orders");
      const body = await res.json();
      setOrders(body.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchOrders();
  }, []);

  async function updateStatus(orderId: string, status: string) {
    const password = getAdminPassword();
    if (!password) return;

    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Orders</h2>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700 mb-4">
          {error}
          <button onClick={fetchOrders} className="ml-2 underline">Retry</button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No orders yet.
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 font-medium">Frog</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                  <td className="px-4 py-3">{order.frogName}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.contactInfo}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "in_transit" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateStatus(order.id, "in_transit")}
                        disabled={updating === order.id}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {updating === order.id ? "..." : "Mark in transit"}
                      </button>
                    )}
                    {order.status === "in_transit" && (
                      <button
                        onClick={() => updateStatus(order.id, "delivered")}
                        disabled={updating === order.id}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {updating === order.id ? "..." : "Mark delivered"}
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <span className="text-xs text-muted-foreground">Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
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
              <a href="/admin/orders" className="text-foreground font-medium hover:underline">Orders</a>
              <a href="/admin/frogs" className="text-muted-foreground hover:text-foreground">Frogs</a>
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