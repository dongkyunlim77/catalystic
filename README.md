# 🚀 Catalystic: AI-Powered Market Intelligence Platform

> **Transform insider trading data into actionable investment intelligence**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Catalystic is a full-stack web application that automatically detects high-conviction insider trading patterns by analyzing SEC Form 4 filings in real-time. When multiple company insiders (CEOs, CFOs, Directors) purchase stock simultaneously, it generates "Cluster Buy" signals that indicate strong internal confidence and potential positive market developments.

### 🎯 **Why This Matters**

- **Information Asymmetry Elimination**: Level the playing field with institutional-grade intelligence
- **Time Savings**: Automate hours of manual research into minutes of analysis
- **Signal Quality**: Focus on high-probability opportunities vs. market noise
- **Competitive Edge**: Access the same "smart money" signals that move markets

## ✨ Features

### 🔍 **Automated Data Collection**
- **Real-time SEC Monitoring**: Fetches insider trading data from Form 4 filings daily
- **Smart Filtering**: Focuses on purchase transactions (buys vs. sells)
- **Duplicate Prevention**: Intelligent deduplication using SEC filing URLs
- **Data Validation**: Ensures data integrity and completeness

### 🧠 **Intelligent Signal Detection**
- **Cluster Buy Algorithm**: Identifies when 3+ unique insiders purchase simultaneously
- **Role-based Analysis**: Weights signals by insider importance (CEO, CFO, Director)
- **Value Thresholds**: Filters for significant purchase amounts
- **Historical Context**: Tracks insider trading patterns over time

### 📊 **Professional Dashboard**
- **Real-time Updates**: Live signal generation and display
- **Responsive Design**: Mobile-optimized interface
- **Clean UI/UX**: Professional, intuitive user experience
- **Data Export**: Download signals for further analysis

### 🚀 **Production Ready**
- **Scalable Architecture**: Built for growth and performance
- **Error Handling**: Comprehensive error management and logging
- **Security**: Secure API integrations and data handling
- **Monitoring**: Built-in logging and debugging capabilities

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SEC Data Sources                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Form 4    │  │   Form 3    │  │   Form 5    │           │
│  │  Filings    │  │  Filings    │  │  Filings    │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Data Engine                         │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │   ingestor.py   │    │signal_detector.py│                   │
│  │                 │    │                 │                   │
│  │ • API Calls     │    │ • Data Analysis │                   │
│  │ • Data Parsing  │    │ • Signal Logic  │                   │
│  │ • DB Storage    │    │ • Alert Gen.    │                   │
│  └─────────────────┘    └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Database                           │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │ form4_filings   │    │     signals     │                   │
│  │                 │    │                 │                   │
│  │ • Raw SEC Data  │    │ • Generated     │                   │
│  │ • Insider Info  │    │   Alerts        │                   │
│  │ • Transaction   │    │ • Analysis      │                   │
│  │   Details       │    │ • Metadata      │                   │
│  └─────────────────┘    └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard                          │
│  ┌─────────────────┐    ┌─────────────────┐                   │
│  │   Next.js App   │    │   Real-time     │                   │
│  │                 │    │   Updates       │                   │
│  │ • Signal Display│    │ • Live Data     │                   │
│  │ • User Interface│    │ • Notifications │                   │
│  │ • Responsive    │    │ • Analytics     │                   │
│  │   Design        │    │ • Export Tools  │                   │
│  └─────────────────┘    └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### **Backend Infrastructure**
- **Python 3.8+**: Core data processing and analysis engine
- **Supabase**: PostgreSQL database with real-time capabilities and Row Level Security
- **SEC API**: Insider trading data via sec-api.io integration
- **Pandas**: Advanced data manipulation and analysis
- **Requests**: HTTP library for API integrations

### **Frontend Framework**
- **Next.js 15**: React framework with App Router and server-side rendering
- **TypeScript 5.0+**: Type-safe development and better developer experience
- **Tailwind CSS 3.0+**: Utility-first CSS framework for rapid UI development
- **React 18**: Modern React with concurrent features and hooks

### **Database & Storage**
- **PostgreSQL**: Robust, scalable relational database
- **Supabase Client**: Real-time database integration and authentication
- **Row Level Security**: Advanced security policies and data access control

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting and style enforcement
- **Git**: Version control and collaboration
- **Virtual Environments**: Python dependency isolation

## 🚀 Quick Start

### **Prerequisites**

- **Python 3.8+** installed on your system
- **Node.js 18+** installed on your system
- **Git** for version control
- **Supabase account** with API keys
- **SEC API key** from sec-api.io

### **Installation Steps**

#### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/catalystic.git
cd catalystic
```

#### **2. Setup Backend Environment**
```bash
# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r catalystic-backend/requirements.txt

# Configure environment variables
cp catalystic-backend/.env.example catalystic-backend/.env
# Edit .env with your actual API keys
```

#### **3. Setup Frontend Environment**
```bash
# Navigate to frontend directory
cd catalystic-app

# Install Node.js dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

#### **4. Database Setup**
Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Create the filings table for storing SEC data
CREATE TABLE public.form4_filings (
    id bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    ticker text,
    insider_name text,
    insider_role text,
    transaction_type text,
    transaction_date date,
    shares_transacted bigint,
    price_per_share numeric,
    total_value numeric,
    sec_filing_url text UNIQUE
);

-- Create the signals table for storing generated alerts
CREATE TABLE public.signals (
    id bigint NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    ticker text,
    signal_type text,
    signal_date date,
    signal_description text,
    status text DEFAULT 'new'
);

-- Disable Row Level Security for public read access to signals
ALTER TABLE public.signals DISABLE ROW LEVEL SECURITY;

-- Add indexes for better performance
CREATE INDEX idx_form4_filings_ticker ON public.form4_filings(ticker);
CREATE INDEX idx_form4_filings_transaction_date ON public.form4_filings(transaction_date);
CREATE INDEX idx_signals_ticker ON public.signals(ticker);
CREATE INDEX idx_signals_signal_date ON public.signals(signal_date);
```

#### **5. Run the Application**

**Terminal 1 - Backend Data Engine:**
```bash
# Ensure you're in the project root with venv activated
cd /path/to/catalystic
source venv/bin/activate

# Fetch new insider trading data
python catalystic-backend/ingestor.py

# Generate trading signals
python catalystic-backend/signal_detector.py
```

**Terminal 2 - Frontend Dashboard:**
```bash
# Navigate to frontend directory
cd catalystic-app

# Start development server
npm run dev
```

#### **6. View Your Application**
- Open your browser and navigate to `http://localhost:3000`
- You should see the Catalystic dashboard with any detected signals
- If you see "No Signals Found", run the backend scripts to populate data

## ⚙️ Configuration

### **Environment Variables**

#### **Backend Configuration** (`catalystic-backend/.env`)
```env
# SEC API credentials for insider trading data
SEC_API_KEY=your_sec_api_key_here

# Supabase database connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
```

#### **Frontend Configuration** (`catalystic-app/.env.local`)
```env
# Supabase connection for frontend
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### **API Keys Setup**

#### **SEC API (sec-api.io)**
1. Visit [sec-api.io](https://sec-api.io)
2. Sign up for a free account
3. Generate your API key
4. Add to `catalystic-backend/.env`

#### **Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to **Settings → API**
4. Copy **Project URL** and **anon public key**
5. Add to both `.env` files

## 📊 Usage

### **Daily Data Updates**

To keep your application current with new insider trading data:

```bash
# Navigate to project root
cd /path/to/catalystic

# Activate virtual environment
source venv/bin/activate

# Run data collection and analysis
python catalystic-backend/ingestor.py
python catalystic-backend/signal_detector.py
```

### **Viewing Signals**

1. **Open Dashboard**: Navigate to `http://localhost:3000`
2. **Browse Signals**: View all detected cluster buy signals
3. **Signal Details**: Each signal shows:
   - Stock ticker symbol
   - Number of insiders involved
   - Total purchase value
   - Transaction date
   - Signal description

### **Understanding Signal Types**

#### **Cluster Buy Signal**
- **Trigger**: 3+ unique insiders purchase the same stock
- **Significance**: High conviction, potential positive developments
- **Action**: Research the company for investment opportunities

#### **High-Value Signal**
- **Trigger**: Single insider makes large purchase (>$100k)
- **Significance**: Strong individual conviction
- **Action**: Investigate insider's track record and timing

## 🔌 API Reference

### **Backend Scripts**

#### **ingestor.py**
```python
# Main function to fetch and store SEC filings
def fetch_recent_purchases():
    """Fetches recent Form 4 filings showing open market purchases"""
    
# Data processing and storage
def save_filings_to_db(filings):
    """Saves unique transactions from Form 4 filings to database"""
```

#### **signal_detector.py**
```python
# Signal generation logic
def find_cluster_buys():
    """Analyzes recent filings to find and record Cluster Buy signals"""
    
# Signal validation and storage
def save_signal(ticker, signal_type, description):
    """Saves generated signal to database"""
```

### **Database Schema**

#### **form4_filings Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key, auto-incrementing |
| `ticker` | text | Stock ticker symbol |
| `insider_name` | text | Name of the insider |
| `insider_role` | text | Role within the company |
| `transaction_type` | text | Type of transaction (Purchase/Sale) |
| `transaction_date` | date | Date of the transaction |
| `shares_transacted` | bigint | Number of shares traded |
| `price_per_share` | numeric | Price per share |
| `total_value` | numeric | Total transaction value |
| `sec_filing_url` | text | URL to SEC filing document |

#### **signals Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key, auto-incrementing |
| `ticker` | text | Stock ticker symbol |
| `signal_type` | text | Type of signal (Cluster Buy, etc.) |
| `signal_date` | date | Date signal was generated |
| `signal_description` | text | Human-readable signal description |
| `status` | text | Signal status (new, processed, etc.) |

## 🚀 Deployment

### **Frontend Deployment (Vercel)**

1. **Build the Application**
   ```bash
   cd catalystic-app
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Deploy automatically on push to main branch

### **Backend Automation (GitHub Actions)**

Create `.github/workflows/daily-update.yml`:

```yaml
name: Daily Data Update
on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          pip install -r catalystic-backend/requirements.txt
      - name: Run data update
        env:
          SEC_API_KEY: ${{ secrets.SEC_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: |
          python catalystic-backend/ingestor.py
          python catalystic-backend/signal_detector.py
```

## 🧪 Testing

### **Backend Testing**
```bash
# Navigate to backend directory
cd catalystic-backend

# Run Python tests (if implemented)
python -m pytest tests/

# Test individual scripts
python ingestor.py --test
python signal_detector.py --test
```

### **Frontend Testing**
```bash
# Navigate to frontend directory
cd catalystic-app

# Run Next.js tests
npm test

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 🔧 Troubleshooting

### **Common Issues**

#### **"Invalid API key" Error**
- Verify your `.env` files contain correct API keys
- Ensure no quotes around values in environment files
- Restart development server after changing environment variables

#### **"No Signals Found" Message**
- Run backend scripts to populate data: `python ingestor.py && python signal_detector.py`
- Check that RLS is disabled on signals table
- Verify Supabase connection is working

#### **Database Connection Issues**
- Confirm Supabase URL and key are correct
- Check that required tables exist in your database
- Verify your IP is not blocked by Supabase

#### **Python Environment Issues**
- Ensure virtual environment is activated: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version`

### **Debug Mode**

Enable debug logging in backend scripts:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m 'Add amazing feature: detailed description'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### **Development Guidelines**

- **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript/TypeScript
- **Documentation**: Add docstrings and comments for complex logic
- **Testing**: Write tests for new features
- **Commits**: Use conventional commit messages

## 📈 Roadmap

### **Phase 1: Core Platform (Current)**
- ✅ Automated data collection from SEC
- ✅ Cluster buy signal detection
- ✅ Professional web dashboard
- ✅ Production-ready architecture

### **Phase 2: Enhanced Intelligence (Next)**
- 🔄 AI-powered signal analysis
- 🔄 Advanced pattern recognition
- 🔄 Historical performance tracking
- 🔄 Custom alert configurations

### **Phase 3: Advanced Features (Future)**
- 📊 Detailed stock information and charts
- 📊 Portfolio integration
- 📊 Mobile application
- 📊 API access for developers

### **Phase 4: Enterprise Features (Long-term)**
- 🏢 Institutional-grade analytics
- 🏢 Multi-user authentication
- 🏢 Advanced reporting tools
- 🏢 White-label solutions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SEC**: For providing comprehensive insider trading data
- **Supabase**: For the excellent database platform and developer experience
- **Next.js Team**: For the amazing React framework and deployment platform
- **Python Community**: For robust data processing and analysis tools
- **Open Source Contributors**: For the libraries and tools that make this possible

## 📞 Contact & Support

- **Project Link**: [https://github.com/yourusername/catalystic](https://github.com/yourusername/catalystic)
- **Live Demo**: [Coming Soon - Deploy to Vercel]
- **Issues**: [GitHub Issues](https://github.com/yourusername/catalystic/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/catalystic/discussions)

## ⭐ Show Your Support

If you find this project helpful, please consider:

- **Starring the repository** ⭐
- **Sharing with colleagues** 📤
- **Contributing code or ideas** 💡
- **Reporting bugs or issues** 🐛

---

**Built with ❤️ by the Catalystic Team**

*Transforming market data into actionable intelligence*
