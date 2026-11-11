import type { Frog } from "@saas/contracts/frogs";
import { OrderForm } from "./order-form";

// Revalidate every 30 seconds
export const revalidate = 30;

async function fetchFrog(id: string): Promise<Frog | null> {
  const origin = process.env.API_ORIGIN || "";
  const res = await fetch(`${origin}/api/frogs/${id}`, {
    headers: { "content-type": "application/json" },
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data ?? null;
}

export default async function FrogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const frog = await fetchFrog(id);

  if (!frog) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold">Frog not found</h1>
          <p className="text-muted-foreground mt-2">
            The frog you are looking for does not exist or has been removed.
          </p>
          <a href="/" className="mt-6 inline-block text-sm text-primary hover:underline">
            &larr; Back to catalogue
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to catalogue
          </a>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{frog.name}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Species</dt>
              <dd className="font-medium">{frog.species}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Size</dt>
              <dd className="font-medium">{frog.size}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{frog.location}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Place an order</h2>
          <OrderForm frogId={frog.id} frogName={frog.name} />
        </div>
      </main>
    </div>
  );
}