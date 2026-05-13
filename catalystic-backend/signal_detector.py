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

SIGNAL_LOOKBACK_DAYS = 7
HIGH_VALUE_PURCHASE_THRESHOLD = 100000

def save_signal(ticker, signal_type, signal_date, description):
    """Saves a generated signal if a matching recent signal does not exist."""
    recent_signal_response = supabase.table('signals').select('id', count='exact').eq('ticker', ticker).eq('signal_type', signal_type).eq('signal_date', signal_date).execute()

    if recent_signal_response.count == 0:
        supabase.table('signals').insert({
            'ticker': ticker,
            'signal_type': signal_type,
            'signal_date': signal_date,
            'signal_description': description,
            'status': 'new'
        }).execute()
        return True

    return False

def find_cluster_buys():
    """Analyzes recent filings to find and record Cluster Buy signals."""
    print("Looking for cluster buy signals...")
    
    # Get all purchase transactions from the last 7 days
    seven_days_ago = (datetime.now() - timedelta(days=SIGNAL_LOOKBACK_DAYS)).strftime('%Y-%m-%d')
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
                save_signal(ticker, 'Cluster Buy', datetime.now().strftime('%Y-%m-%d'), description)

    print("Finished signal detection.")

def find_high_value_purchases():
    """Analyzes recent filings to find large individual insider purchase signals."""
    print("Looking for high-value purchase signals...")

    seven_days_ago = (datetime.now() - timedelta(days=SIGNAL_LOOKBACK_DAYS)).strftime('%Y-%m-%d')
    response = supabase.table('form4_filings').select('*').eq('transaction_type', 'Purchase').gte('transaction_date', seven_days_ago).execute()

    if not response.data:
        print("No recent purchase filings found to analyze.")
        return

    for trade in response.data:
        ticker = trade.get('ticker')
        if not ticker or ticker.upper() in ('NONE', 'N.A.'):
            continue

        total_value = float(trade.get('total_value') or 0)
        if total_value < HIGH_VALUE_PURCHASE_THRESHOLD:
            continue

        signal_date = datetime.now().strftime('%Y-%m-%d')
        description = (
            f"{trade.get('insider_name')} ({trade.get('insider_role')}) purchased "
            f"${total_value:,.2f} worth of stock on {trade.get('transaction_date')}."
        )

        if save_signal(ticker, 'High-Value Purchase', signal_date, description):
            print(f"FOUND SIGNAL: High-Value Purchase at {ticker}")

    print("Finished high-value purchase detection.")

if __name__ == "__main__":
    find_cluster_buys()
    find_high_value_purchases()
