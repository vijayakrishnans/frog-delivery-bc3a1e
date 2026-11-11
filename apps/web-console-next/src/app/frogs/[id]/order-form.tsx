"use client";

import * as React from "react";

interface OrderFormProps {
  frogId: string;
  frogName: string;
}

interface FormState {
  customerName: string;
  contactInfo: string;
}

export function OrderForm({ frogId, frogName }: OrderFormProps) {
  const [form, setForm] = React.useState<FormState>({ customerName: "", contactInfo: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.customerName.trim() || !form.contactInfo.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          frogId,
          customerName: form.customerName.trim(),
          contactInfo: form.contactInfo.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.error?.message || "Failed to place order");
      }

      const body = await res.json();
      setOrderId(body.data?.id ?? null);
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (confirmed) {
    return (
      <div className="text-center py-6">
        <div className="text-2xl mb-2">&#10003;</div>
        <h3 className="text-lg font-semibold text-green-600">Order confirmed!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Your order for <strong>{frogName}</strong> has been placed.
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground mt-2">
            Order reference: {orderId}
          </p>
        )}
        <a
          href="/"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          &larr; Back to catalogue
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ordering: <strong>{frogName}</strong>
      </p>

      <div>
        <label htmlFor="customerName" className="block text-sm font-medium mb-1">
          Your name
        </label>
        <input
          id="customerName"
          type="text"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Jane Smith"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="contactInfo" className="block text-sm font-medium mb-1">
          Contact info
        </label>
        <input
          id="contactInfo"
          type="text"
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Email or phone number"
          value={form.contactInfo}
          onChange={(e) => setForm({ ...form, contactInfo: e.target.value })}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? "Placing order..." : "Place order"}
      </button>
    </form>
  );
}