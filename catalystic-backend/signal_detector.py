# signal_detector.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables (API keys)
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Environment Variable Validation ---
if not all([SUPABASE_URL, SUPABASE_KEY]):
    print("---")
    print("ERROR: Missing Supabase environment variables.")
    print("Please ensure your .env file in 'catalystic-backend' is correct.")
    print("---")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def find_cluster_buys():
    """Analyzes recent filings to find and record Cluster Buy signals."""
    print("Looking for cluster buy signals...")
    
    # Get all purchase transactions from the last 7 days
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    response = supabase.table('form4_filings').select('*').eq('transaction_type', 'Purchase').gte('transaction_date', seven_days_ago).execute()
    
    if not response.data:
        print("No recent purchase filings found to analyze.")
        return

    # Group all trades by their stock ticker
    trades_by_ticker = {}
    for trade in response.data:
        ticker = trade['ticker']
        # Defensively skip any bad data that might still be in the DB
        if not ticker or ticker.upper() in ('NONE', 'N.A.'):
            continue

        if ticker not in trades_by_ticker:
            trades_by_ticker[ticker] = []
        trades_by_ticker[ticker].append(trade)

    for ticker, trades in trades_by_ticker.items():
        # A signal requires unique insiders. We use a set to count them.
        unique_insiders = set(trade['insider_name'] for trade in trades)
        
        # --- Our Core Signal Rule ---
        if len(unique_insiders) >= 3:
            # Check if we already created a signal for this ticker recently to avoid duplicates.
            recent_signal_response = supabase.table('signals').select('id', count='exact').eq('ticker', ticker).eq('signal_type', 'Cluster Buy').gte('signal_date', seven_days_ago).execute()
            
            if recent_signal_response.count == 0:
                total_value = sum(float(trade['total_value']) for trade in trades)
                
                # Create a readable list of insiders for the description
                insider_list = list(unique_insiders)
                insider_preview = f"{', '.join(insider_list[:2])} and others" if len(insider_list) > 2 else ', '.join(insider_list)

                description = f"{len(unique_insiders)} insiders, including {insider_preview}, purchased a combined ${total_value:,.2f} worth of stock."
                
                print(f"FOUND SIGNAL: Cluster Buy at {ticker}")
                supabase.table('signals').insert({
                    'ticker': ticker,
                    'signal_type': 'Cluster Buy',
                    'signal_date': datetime.now().strftime('%Y-%m-%d'),
                    'signal_description': description,
                    'status': 'new'
                }).execute()

    print("Finished signal detection.")

if __name__ == "__main__":
    find_cluster_buys() 