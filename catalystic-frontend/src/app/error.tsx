'use client';

export default function Error() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <div className="rounded-md border border-rose-200 bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Dashboard error</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Unable to load market signals. Check Supabase configuration or try again later.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Catalystic is a research aid only. Signal rankings should be reviewed with supporting evidence and risk factors.
          </p>
        </div>
      </section>
    </main>
  );
}
