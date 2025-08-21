# ingestor.py
import os
import requests
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()
SEC_API_KEY = os.getenv("SEC_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# --- Environment Variable Validation ---
if not all([SEC_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("---")
    print("ERROR: Missing environment variables.")
    print("Please ensure you have a file named '.env' in the 'catalystic-backend' directory.")
    print("It should contain your SEC_API_KEY, SUPABASE_URL, and SUPABASE_KEY.")
    print("---")
    exit()

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_insider_roles(relationship):
    """Constructs a readable string of the insider's roles."""
    roles = []
    if relationship.get('isDirector'):
        roles.append('Director')
    if relationship.get('isOfficer'):
        roles.append(relationship.get('officerTitle', 'Officer'))
    if relationship.get('isTenPercentOwner'):
        roles.append('10% Owner')
    if relationship.get('isOther'):
        roles.append('Other')
    return ', '.join(roles) if roles else 'N/A'

def fetch_recent_purchases():
    """Fetches recent Form 4 filings showing open market purchases from sec-api.io."""
    print("Fetching recent insider purchases from sec-api.io...")
    three_days_ago = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
    
    # This is the correct endpoint for insider trading data
    api_url = "https://api.sec-api.io/insider-trading"
    headers = {'Authorization': SEC_API_KEY}

    # The query format for this endpoint is a simple Lucene string.
    # We are looking for Form 4s with a transaction code of 'P' (Purchase)
    # filed in the last 3 days.
    query = {
        "query": f"nonDerivativeTable.transactions.coding.code:\"P\" AND filedAt:[{three_days_ago} TO *]",
        "from": "0",
        "size": "50",
        "sort": [{"filedAt": {"order": "desc"}}]
    }
    
    try:
        response = requests.post(api_url, json=query, headers=headers)
        response.raise_for_status()
        # The data is in the 'transactions' key for this endpoint.
        return response.json().get('transactions', [])
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from sec-api.io: {e}")
        print(f"Response Body: {response.text if 'response' in locals() else 'No response'}")
        return []

def save_filings_to_db(filings):
    """Saves unique transactions from Form 4 filings to the database."""
    print(f"Found {len(filings)} filings to process.")
    
    for filing in filings:
        # A single filing can report multiple transactions. We must process each one.
        for trade in filing.get('nonDerivativeTable', {}).get('transactions', []):
            # We double-check that the transaction is a purchase.
            if trade.get('coding', {}).get('code') != 'P':
                continue

            ticker = filing.get('issuer', {}).get('tradingSymbol')
            # If a filing has no ticker, or a placeholder like 'NONE' or 'N.A.', it's not useful.
            if not ticker or ticker.upper() in ('NONE', 'N.A.'):
                continue

            issuer_cik = filing.get('issuer', {}).get('cik')
            accession_no = filing.get('accessionNo')
            transaction_date = trade.get('transactionDate')
            
            # We use the unique URL of the SEC filing itself for deduplication.
            # This prevents inserting data from the same filing multiple times if the script is re-run.
            sec_filing_url = f"https://www.sec.gov/Archives/edgar/data/{issuer_cik}/{accession_no.replace('-', '')}/{accession_no}.txt"
            
            response = supabase.table('form4_filings').select('id', count='exact').eq('sec_filing_url', sec_filing_url).execute()
            
            # This logic assumes we only want to record the *first* purchase from any given filing document.
            if response.count == 0:
                shares = trade.get('amounts', {}).get('shares')
                price_per_share = trade.get('amounts', {}).get('pricePerShare')

                if shares is None or price_per_share is None:
                    continue
                
                print(f"Saving new trade for {ticker}")
                
                # FIX: The 'shares_transacted' column is a bigint, but the API can send decimals
                # for fractional shares. We convert to an integer to prevent the database error.
                shares_value = int(float(shares))

                data_to_insert = {
                    'ticker': ticker,
                    'insider_name': filing.get('reportingOwner', {}).get('name'),
                    'insider_role': get_insider_roles(filing.get('reportingOwner', {}).get('relationship', {})),
                    'transaction_type': 'Purchase',
                    'transaction_date': transaction_date,
                    'shares_transacted': shares_value,
                    'price_per_share': price_per_share,
                    'total_value': float(shares) * float(price_per_share),
                    'sec_filing_url': sec_filing_url
                }
                supabase.table('form4_filings').insert(data_to_insert).execute()
    
    print("Finished saving trades.")

if __name__ == "__main__":
    all_filings = fetch_recent_purchases()
    if all_filings:
        save_filings_to_db(all_filings)