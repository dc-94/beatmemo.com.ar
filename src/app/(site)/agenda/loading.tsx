export default function Loading() {
  return (
    <main className="min-h-screen bg-brand-black-200 pb-32">
      {/* Hero placeholder */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full bg-neutral-900 animate-pulse" />

      {/* Pills de navegación */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-4 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-neutral-800 animate-pulse" />
        ))}
      </div>

      {/* Grilla de cards */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="bg-neutral-900 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-neutral-800" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 bg-neutral-800 rounded" />
              <div className="h-5 w-3/4 bg-neutral-800 rounded" />
              <div className="h-4 w-1/2 bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}