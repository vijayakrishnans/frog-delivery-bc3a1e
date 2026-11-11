import type { Frog } from "@saas/contracts/frogs";

// Revalidate every 60 seconds
export const revalidate = 60;

async function fetchFrogs(): Promise<Frog[]> {
  const origin = process.env.API_ORIGIN || "";
  try {
    const res = await fetch(`${origin}/api/frogs`, {
      headers: { "content-type": "application/json" },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return body.data ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const frogs = await fetchFrogs();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Frog Delivery</h1>
          <p className="text-muted-foreground mt-1">
            Find your perfect amphibian companion and have it delivered right to your door.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-6">Frogs available for delivery</h2>

        {frogs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No frogs available right now.</p>
            <p className="text-sm mt-1">Check back soon — new frogs are added regularly.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {frogs.map((frog) => (
              <a
                key={frog.id}
                href={`/frogs/${frog.id}`}
                className="block rounded-lg border bg-card p-5 hover:shadow-md hover:border-primary/50 transition-all"
              >
                <h3 className="text-xl font-semibold">{frog.name}</h3>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Species:</span> {frog.species}</p>
                  <p><span className="font-medium text-foreground">Size:</span> {frog.size}</p>
                  <p><span className="font-medium text-foreground">Location:</span> {frog.location}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}