// src/app/page.tsx
import { createClient } from '@supabase/supabase-js';

// Define the type for a signal object for type safety
type Signal = {
  id: number;
  created_at: string;
  ticker: string;
  signal_type: string;
  signal_date: string;
  signal_description: string;
  status: string;
};

// This server-side function fetches data directly from Supabase
async function getSignals(): Promise<Signal[]> {
  // Create a standard Supabase client for server-side operations.
  // We MUST use the NEXT_PUBLIC_ prefixed variables here.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: signals, error } = await supabase
    .from('signals')
    .select('*')
    .order('signal_date', { ascending: false }); // Show newest signals first

  if (error) {
    // Log the error for debugging on the server, but don't expose it to the client
    console.error('Error fetching signals:', error.message);
    // Return an empty array to prevent the page from crashing
    return [];
  }
  return signals;
}

export default async function HomePage() {
  const signals = await getSignals();

  return (
    <main className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold mb-2 text-gray-800 tracking-tight">Catalystic</h1>
        <p className="text-xl text-gray-500">High-Conviction Market Signals</p>
      </header>
      
      <div className="space-y-6 max-w-2xl mx-auto">
        {signals.length > 0 ? (
          signals.map((signal) => (
            <div key={signal.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {signal.signal_type}
                </span>
                <span className="text-sm text-gray-500">{new Date(signal.signal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{signal.ticker}</h2>
              <p className="text-gray-700 text-base">{signal.signal_description}</p>
            </div>
          ))
        ) : (
          <div className="text-center bg-white p-10 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Signals Found</h2>
            <p className="text-gray-500">The signal detector hasn't found any cluster buys yet. Run the backend scripts and check back soon!</p>
          </div>
        )}
      </div>
    </main>
  );
}
