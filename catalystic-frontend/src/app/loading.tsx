export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Catalystic Market Intelligence
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal text-slate-950 md:text-5xl">
            Stock discovery from ranked market signals
          </h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Loading ranked market signals…</p>
          <p className="mt-2 text-sm text-slate-500">Gathering recommendations, supporting evidence, and market context.</p>
        </div>
      </section>
    </main>
  );
}
