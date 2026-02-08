# Portfolio Optimizer Configuration

# Benchmark ETFs for geographic allocation
BENCHMARKS = {
    'us_equity': 'ITOT',      # iShares Core S&P Total US Stock Market
    'intl_developed': 'IEFA', # iShares Core MSCI EAFE
    'emerging': 'IEMG',       # iShares Core MSCI Emerging Markets
    'us_bonds': 'AGG',        # iShares Core US Aggregate Bond
}

# Fund screening criteria
MIN_AUM = 100_000_000  # $100M minimum
MIN_TRACK_RECORD_YEARS = 1

# Return periods to calculate
RETURN_PERIODS = ['1Y', '3Y', '5Y', '10Y']

# Asset class mappings for auto-benchmark
ASSET_CLASS_TO_BENCHMARK = {
    'US Equity': 'us_equity',
    'US Stock': 'us_equity',
    'Large Blend': 'us_equity',
    'Large Growth': 'us_equity',
    'Large Value': 'us_equity',
    'Mid-Cap': 'us_equity',
    'Small Blend': 'us_equity',
    'Small Growth': 'us_equity',
    'Small Value': 'us_equity',
    
    'Foreign Large Blend': 'intl_developed',
    'Foreign Large Growth': 'intl_developed',
    'Foreign Large Value': 'intl_developed',
    'International': 'intl_developed',
    'Europe Stock': 'intl_developed',
    'Japan Stock': 'intl_developed',
    
    'Diversified Emerging': 'emerging',
    'Emerging Markets': 'emerging',
    'China Region': 'emerging',
    'India Equity': 'emerging',
    'Latin America': 'emerging',
    
    'Intermediate Core Bond': 'us_bonds',
    'Intermediate Core-Plus Bond': 'us_bonds',
    'Short-Term Bond': 'us_bonds',
    'Long-Term Bond': 'us_bonds',
    'Corporate Bond': 'us_bonds',
    'US Bonds': 'us_bonds',
    'Fixed Income': 'us_bonds',
}
