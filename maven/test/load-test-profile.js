/**
 * Load Test Profile - Run this in browser console at mavenwealth.ai
 * 
 * 1. Open https://mavenwealth.ai
 * 2. Open DevTools (F12 or Cmd+Option+I)
 * 3. Go to Console tab
 * 4. Paste this entire script and press Enter
 * 5. Refresh the page to see the loaded profile
 */

const testProfile = {
  "firstName": "Eli",
  "lastName": "Maven",
  "email": "eli@mavenwealth.ai",
  "dateOfBirth": "1985-03-15",
  "state": "VA",
  "filingStatus": "Married Filing Jointly",
  "householdIncome": "$200,000 - $500,000",
  
  "cashAccounts": [
    { "id": "cash-1", "name": "Chase Checking", "institution": "Chase", "balance": 15000, "type": "Checking" },
    { "id": "cash-2", "name": "Marcus HYSA", "institution": "Goldman Sachs", "balance": 45000, "type": "High-Yield Savings", "interestRate": 4.4 },
    { "id": "cash-3", "name": "Fidelity Money Market", "institution": "Fidelity", "balance": 25000, "type": "Money Market" }
  ],
  
  "retirementAccounts": [
    {
      "id": "ret-1",
      "name": "Capital Group 401(k)",
      "institution": "Capital Group",
      "balance": 385000,
      "type": "401(k)",
      "employer": "Tech Corp",
      "contributionPercent": 15,
      "employerMatchPercent": 6,
      "holdings": [
        { "ticker": "AGTHX", "name": "Growth Fund of America", "shares": 450, "costBasis": 28000, "currentPrice": 78.50, "currentValue": 35325 },
        { "ticker": "AIVSX", "name": "Investment Company of America", "shares": 380, "costBasis": 22000, "currentPrice": 52.30, "currentValue": 19874 },
        { "ticker": "ANWFX", "name": "New Perspective Fund", "shares": 520, "costBasis": 35000, "currentPrice": 68.20, "currentValue": 35464 },
        { "ticker": "AMRMX", "name": "American Mutual Fund", "shares": 300, "costBasis": 18000, "currentPrice": 55.80, "currentValue": 16740 },
        { "ticker": "ANCFX", "name": "New Economy Fund", "shares": 280, "costBasis": 24000, "currentPrice": 72.40, "currentValue": 20272 },
        { "ticker": "ABALX", "name": "American Balanced Fund", "shares": 450, "costBasis": 22000, "currentPrice": 35.20, "currentValue": 15840 },
        { "ticker": "CAIBX", "name": "Capital Income Builder", "shares": 620, "costBasis": 28000, "currentPrice": 68.90, "currentValue": 42718 },
        { "ticker": "VTHRX", "name": "Vanguard Target 2035", "shares": 1200, "costBasis": 52000, "currentPrice": 42.30, "currentValue": 50760 },
        { "ticker": "VFIAX", "name": "Vanguard 500 Index", "shares": 280, "costBasis": 95000, "currentPrice": 485.20, "currentValue": 135856 }
      ]
    },
    {
      "id": "ret-2",
      "name": "Traditional IRA (Fidelity)",
      "institution": "Fidelity",
      "balance": 125000,
      "type": "Traditional IRA",
      "holdings": [
        { "ticker": "VTI", "name": "Vanguard Total Stock Market", "shares": 180, "costBasis": 38000, "currentPrice": 268.50, "currentValue": 48330 },
        { "ticker": "VXUS", "name": "Vanguard Total International", "shares": 320, "costBasis": 18000, "currentPrice": 62.80, "currentValue": 20096 },
        { "ticker": "BND", "name": "Vanguard Total Bond Market", "shares": 280, "costBasis": 22000, "currentPrice": 72.40, "currentValue": 20272 },
        { "ticker": "VNQ", "name": "Vanguard Real Estate ETF", "shares": 150, "costBasis": 12000, "currentPrice": 88.50, "currentValue": 13275 },
        { "ticker": "SCHD", "name": "Schwab US Dividend Equity", "shares": 280, "costBasis": 18000, "currentPrice": 82.30, "currentValue": 23044 }
      ]
    },
    {
      "id": "ret-3",
      "name": "Roth IRA (Schwab)",
      "institution": "Schwab",
      "balance": 78000,
      "type": "Roth IRA",
      "holdings": [
        { "ticker": "QQQ", "name": "Invesco QQQ Trust", "shares": 45, "costBasis": 15000, "currentPrice": 485.20, "currentValue": 21834 },
        { "ticker": "ARKK", "name": "ARK Innovation ETF", "shares": 120, "costBasis": 8500, "currentPrice": 52.30, "currentValue": 6276 },
        { "ticker": "VGT", "name": "Vanguard Info Tech ETF", "shares": 35, "costBasis": 12000, "currentPrice": 562.40, "currentValue": 19684 },
        { "ticker": "SMH", "name": "VanEck Semiconductor ETF", "shares": 55, "costBasis": 10000, "currentPrice": 245.80, "currentValue": 13519 },
        { "ticker": "SOXX", "name": "iShares Semiconductor ETF", "shares": 30, "costBasis": 8000, "currentPrice": 558.90, "currentValue": 16767 }
      ]
    },
    {
      "id": "ret-4",
      "name": "HSA (Fidelity)",
      "institution": "Fidelity",
      "balance": 32000,
      "type": "HSA",
      "holdings": [
        { "ticker": "FZROX", "name": "Fidelity ZERO Total Market", "shares": 380, "costBasis": 18000, "currentPrice": 16.80, "currentValue": 6384 },
        { "ticker": "FXAIX", "name": "Fidelity 500 Index", "shares": 120, "costBasis": 14000, "currentPrice": 198.50, "currentValue": 23820 }
      ]
    }
  ],
  
  "investmentAccounts": [
    {
      "id": "inv-1",
      "name": "Joint Brokerage (Fidelity)",
      "institution": "Fidelity",
      "balance": 195000,
      "type": "Individual",
      "holdings": [
        { "ticker": "AAPL", "name": "Apple Inc", "shares": 150, "costBasis": 18000, "currentPrice": 185.20, "currentValue": 27780, "acquisitionDate": "2020-03-15" },
        { "ticker": "MSFT", "name": "Microsoft Corp", "shares": 85, "costBasis": 15000, "currentPrice": 415.80, "currentValue": 35343, "acquisitionDate": "2019-06-20" },
        { "ticker": "GOOGL", "name": "Alphabet Inc", "shares": 45, "costBasis": 8000, "currentPrice": 175.40, "currentValue": 7893, "acquisitionDate": "2021-01-10" },
        { "ticker": "AMZN", "name": "Amazon.com Inc", "shares": 65, "costBasis": 12000, "currentPrice": 198.50, "currentValue": 12903, "acquisitionDate": "2020-08-05" },
        { "ticker": "NVDA", "name": "NVIDIA Corp", "shares": 40, "costBasis": 8500, "currentPrice": 875.20, "currentValue": 35008, "acquisitionDate": "2022-04-12" },
        { "ticker": "VOO", "name": "Vanguard S&P 500 ETF", "shares": 55, "costBasis": 22000, "currentPrice": 485.30, "currentValue": 26692, "acquisitionDate": "2018-11-01" },
        { "ticker": "VEA", "name": "Vanguard FTSE Developed", "shares": 280, "costBasis": 12000, "currentPrice": 52.40, "currentValue": 14672, "acquisitionDate": "2021-05-15" },
        { "ticker": "VWO", "name": "Vanguard FTSE Emerging", "shares": 320, "costBasis": 14500, "currentPrice": 45.80, "currentValue": 14656, "acquisitionDate": "2021-09-20" },
        { "ticker": "TSLA", "name": "Tesla Inc", "shares": 25, "costBasis": 6500, "currentPrice": 178.50, "currentValue": 4463, "acquisitionDate": "2023-01-15" },
        { "ticker": "META", "name": "Meta Platforms", "shares": 30, "costBasis": 5500, "currentPrice": 525.40, "currentValue": 15762, "acquisitionDate": "2022-11-10" }
      ]
    },
    {
      "id": "inv-2",
      "name": "Crypto (Coinbase)",
      "institution": "Coinbase",
      "balance": 85000,
      "type": "Individual",
      "holdings": [
        { "ticker": "BTC", "name": "Bitcoin", "shares": 0.75, "costBasis": 28000, "currentPrice": 98500, "currentValue": 73875 },
        { "ticker": "ETH", "name": "Ethereum", "shares": 2.5, "costBasis": 6000, "currentPrice": 3450, "currentValue": 8625 },
        { "ticker": "TAO", "name": "Bittensor", "shares": 8, "costBasis": 2400, "currentPrice": 420, "currentValue": 3360 }
      ]
    },
    {
      "id": "inv-3",
      "name": "Stock Options (E*Trade)",
      "institution": "E*Trade",
      "balance": 45000,
      "type": "Individual",
      "holdings": [
        { "ticker": "CIFR", "name": "Cipher Mining", "shares": 2500, "costBasis": 15000, "currentPrice": 8.50, "currentValue": 21250 },
        { "ticker": "IREN", "name": "Iris Energy", "shares": 1200, "costBasis": 12000, "currentPrice": 18.20, "currentValue": 21840 }
      ]
    }
  ],
  
  "realEstateEquity": 185000,
  "cryptoValue": 0,
  "businessEquity": 25000,
  "otherAssets": 15000,
  
  "liabilities": [
    { "id": "liab-1", "name": "Home Mortgage", "type": "Mortgage", "balance": 425000, "interestRate": 3.25, "monthlyPayment": 2850 },
    { "id": "liab-2", "name": "Tesla Model Y", "type": "Auto Loan", "balance": 28000, "interestRate": 4.9, "monthlyPayment": 650 },
    { "id": "liab-3", "name": "Chase Sapphire", "type": "Credit Card", "balance": 4500, "interestRate": 24.99, "monthlyPayment": 500 }
  ],
  
  "goals": [
    { "id": "goal-1", "name": "Retire at 55", "targetAmount": 3000000, "targetDate": "2040-03-15", "priority": "high" },
    { "id": "goal-2", "name": "Kids' College Fund", "targetAmount": 200000, "targetDate": "2035-09-01", "priority": "high" },
    { "id": "goal-3", "name": "Vacation Home", "targetAmount": 150000, "targetDate": "2030-06-01", "priority": "medium" }
  ],
  
  "primaryGoal": "Early retirement with financial independence",
  "riskTolerance": "growth",
  "investmentExperience": "advanced",
  "onboardingComplete": true
};

// Save to localStorage
localStorage.setItem('maven_user_profile', JSON.stringify(testProfile));
localStorage.setItem('maven_onboarding_complete', 'true');

// Set cookie for middleware
document.cookie = 'maven_onboarded=true; path=/; max-age=31536000; SameSite=Lax';

console.log('✅ Test profile loaded!');
console.log('📊 Net Worth: ~$800K');
console.log('📈 45+ holdings across 8 accounts');
console.log('🔄 Refresh the page to see the dashboard');
