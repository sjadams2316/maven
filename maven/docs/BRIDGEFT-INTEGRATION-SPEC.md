# BridgeFT Integration Specification

*Data mapping and integration blueprint for Maven RIA launch*

---

## Overview

BridgeFT WealthTech API provides multi-custodial data aggregation. This document maps BridgeFT's data model to Maven's Prisma schema for seamless RIA operations.

**Base URL:** `https://api.bridgeft.com/v2`

**Custodian Coverage (Day 1):**
- Altruist (primary)
- Charles Schwab (secondary)

---

## 1. Authentication Flow

### OAuth2 Token Exchange

```
POST /oauth2/token
Authorization: Basic {base64(client_id:client_secret)}
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Maven Storage (Prisma)

```prisma
model BridgeFTConnection {
  id                String   @id @default(cuid())
  userId            String   @unique
  bridgeftClientId  String   @unique
  accessToken       String   // ENCRYPTED - JWT token
  refreshToken      String?  // ENCRYPTED
  status            String   @default("active")
  lastSyncedAt      DateTime?
  linkedAccountIds  String[]
}
```

---

## 2. Data Model Mapping

### Accounts

**BridgeFT Endpoint:** `/data/source/accounts`

| BridgeFT Field | Type | Maven Field (Account) | Notes |
|----------------|------|----------------------|-------|
| `id` | string | `plaidAccountId` | Use as external reference |
| `account_number` | string | `mask` | Last 4 digits only |
| `name` | string | `name` | |
| `account_type` | string | `type` | Map to: depository, investment, credit, loan |
| `account_sub_type` | string | `subtype` | 401k, ira, brokerage, etc. |
| `status` | string | - | Filter active only |
| `custodian` | string | - | altruist, schwab, etc. |
| `advisor_code` | string | - | Links to Advisor |

**Type Mapping:**
```typescript
const ACCOUNT_TYPE_MAP = {
  'BROKERAGE': { type: 'investment', subtype: 'brokerage' },
  'IRA': { type: 'investment', subtype: 'ira' },
  'ROTH_IRA': { type: 'investment', subtype: 'roth_ira' },
  '401K': { type: 'investment', subtype: '401k' },
  'TRUST': { type: 'investment', subtype: 'trust' },
  'CASH': { type: 'depository', subtype: 'checking' },
};
```

---

### Positions (Holdings)

**BridgeFT Endpoint:** `/data/source/positions`

| BridgeFT Field | Type | Maven Field (Holding) | Notes |
|----------------|------|----------------------|-------|
| `account_id` | string | `accountId` | FK to Account |
| `security_id` | string | `securityId` | FK to Security |
| `source_security_symbol` | string | `symbol` | Ticker |
| `direction` | string | - | LONG or SHORT |
| `abs_units` | number | `quantity` | Share count |
| `abs_value` | number | `currentValue` | Market value |
| `abs_value_unit_price` | number | `currentPrice` | Price per share |
| `abs_cost_basis` | number | `costBasis` | Total cost basis |
| `unrealized_gain_loss` | number | - | Calculated field |
| `first_open_date` | date | - | For tax lot aging |
| `reported_date` | date | `lastSyncedAt` | |

**Position Sync Logic:**
```typescript
async function syncPositions(accountId: string, positions: BridgeFTPosition[]) {
  // Upsert each position
  for (const pos of positions) {
    await prisma.holding.upsert({
      where: { 
        accountId_symbol: { accountId, symbol: pos.source_security_symbol }
      },
      update: {
        quantity: pos.abs_units,
        currentValue: pos.abs_value,
        currentPrice: pos.abs_value_unit_price,
        costBasis: pos.abs_cost_basis,
        lastSyncedAt: new Date(pos.reported_date),
      },
      create: {
        accountId,
        symbol: pos.source_security_symbol,
        quantity: pos.abs_units,
        currentValue: pos.abs_value,
        currentPrice: pos.abs_value_unit_price,
        costBasis: pos.abs_cost_basis,
        lastSyncedAt: new Date(pos.reported_date),
      }
    });
  }
}
```

---

### Tax Lots

**BridgeFT Endpoint:** `/data/source/lots`

| BridgeFT Field | Type | Maven Field (TaxLot) | Notes |
|----------------|------|---------------------|-------|
| `account_id` | string | `accountId` | FK |
| `security_id` | string | `securityId` | FK |
| `lot_identifier` | string | - | External ref |
| `source_security_symbol` | string | `symbol` | |
| `direction` | string | - | LONG/SHORT |
| `abs_current_units` | number | `remainingQuantity` | Current shares |
| `abs_original_open_units` | number | `quantity` | Original shares |
| `original_open_date` | date | `acquisitionDate` | |
| `abs_cost_basis` | number | `costBasis` | |
| `cost_basis_unit_price` | number | - | Per share cost |
| `cost_basis_fully_known` | boolean | `isCovered` | |
| `unrealized_gain_loss` | number | - | Calculated |
| `duration` | string | - | "LT" or "ST" |
| `wash_sale` | boolean | - | Wash sale flag |
| `disallowed_loss_amount` | number | - | |
| `lot_selection_method` | string | - | FIFO, LIFO, etc. |

**Tax Lot Sync:**
```typescript
async function syncTaxLots(accountId: string, lots: BridgeFTLot[]) {
  for (const lot of lots) {
    await prisma.taxLot.upsert({
      where: {
        accountId_symbol_acquisitionDate: {
          accountId,
          symbol: lot.source_security_symbol,
          acquisitionDate: new Date(lot.original_open_date),
        }
      },
      update: {
        quantity: lot.abs_original_open_units,
        remainingQuantity: lot.abs_current_units,
        costBasis: lot.abs_cost_basis,
        isCovered: lot.cost_basis_fully_known,
      },
      create: {
        accountId,
        userId: account.userId,
        symbol: lot.source_security_symbol,
        quantity: lot.abs_original_open_units,
        remainingQuantity: lot.abs_current_units,
        costBasis: lot.abs_cost_basis,
        acquisitionDate: new Date(lot.original_open_date),
        isCovered: lot.cost_basis_fully_known,
      }
    });
  }
}
```

---

### Transactions

**BridgeFT Endpoint:** `/data/source/transactions`

| BridgeFT Field | Type | Maven Field (Transaction) | Notes |
|----------------|------|--------------------------|-------|
| `account_id` | string | `accountId` | FK |
| `transaction_date` | date | `date` | |
| `settle_date` | date | - | |
| `transaction_type` | string | `type` | BUY, SELL, DIV, etc. |
| `source_security_symbol` | string | `symbol` | |
| `abs_units` | number | `quantity` | |
| `abs_amount` | number | `amount` | Dollar amount |
| `abs_price` | number | `price` | Per share |
| `description` | string | `name` | |

**Transaction Type Mapping:**
```typescript
const TX_TYPE_MAP = {
  'BUY': 'buy',
  'SELL': 'sell',
  'DIVIDEND': 'dividend',
  'INTEREST': 'interest',
  'FEE': 'fee',
  'TRANSFER_IN': 'transfer',
  'TRANSFER_OUT': 'transfer',
  'CONTRIBUTION': 'transfer',
  'WITHDRAWAL': 'transfer',
};
```

---

### Account Balances

**BridgeFT Endpoint:** `/data/source/account-balances`

| BridgeFT Field | Type | Maven Field (Account) | Notes |
|----------------|------|----------------------|-------|
| `account_id` | string | - | FK |
| `cash_value` | number | - | Cash position |
| `securities_value` | number | - | Holdings value |
| `total_unrealized_gain_loss` | number | - | Calculated |
| `reported_date` | date | `lastSyncedAt` | |

**Balance Calculation:**
```typescript
// Total account value = cash + securities
const accountValue = balance.cash_value + balance.securities_value;

// Store as separate holdings
await prisma.holding.upsert({
  where: { accountId_symbol: { accountId, symbol: 'CASH' }},
  update: { currentValue: balance.cash_value },
  create: {
    accountId,
    symbol: 'CASH',
    name: 'Cash & Equivalents',
    quantity: balance.cash_value, // $1 = 1 unit
    currentValue: balance.cash_value,
    currentPrice: 1,
  }
});
```

---

### Realized Gain/Loss

**BridgeFT Endpoint:** `/data/source/realized-gain-loss`

| BridgeFT Field | Type | Maven Field (Disposition) | Notes |
|----------------|------|--------------------------|-------|
| `account_id` | string | via TaxLot | |
| `security_id` | string | via TaxLot | |
| `close_date` | date | `saleDate` | |
| `abs_closed_units` | number | `quantity` | |
| `abs_closed_value` | number | `proceeds` | |
| `amount` | number | `gainLoss` | |
| `amount_lt` | number | - | Long-term portion |
| `amount_st` | number | - | Short-term portion |
| `open_date` | date | via TaxLot | |

---

## 3. Sync Strategy

### Initial Sync (Onboarding)

```
1. Authenticate with BridgeFT
2. Fetch all advisor codes → Store in Advisor model
3. For each advisor code:
   a. Fetch accounts → Create Account records
   b. Fetch positions → Create Holding records
   c. Fetch lots → Create TaxLot records
   d. Fetch balances → Update Account balances
4. Mark BridgeFTConnection.lastSyncedAt
```

### Incremental Sync (Daily)

```
Frequency: T+1 (data available ~6am EST)

1. Fetch positions with filter: reported_date >= lastSyncedAt
2. Upsert changed positions
3. Fetch new transactions
4. Fetch realized gain/loss for tax tracking
5. Update lastSyncedAt
```

### Real-Time Sync (Optional)

BridgeFT supports webhooks for:
- New account added
- Account status change
- Large transaction alert

```typescript
// Webhook handler
app.post('/webhooks/bridgeft', async (req, res) => {
  const { event_type, payload } = req.body;
  
  switch (event_type) {
    case 'account.created':
      await syncAccount(payload.account_id);
      break;
    case 'position.updated':
      await syncPosition(payload.account_id, payload.security_id);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## 4. Data Source Matrix

| Data Type | BridgeFT | Altruist Direct | Schwab Direct | Manual Entry |
|-----------|----------|-----------------|---------------|--------------|
| Accounts | ✅ Primary | Fallback | Fallback | ✅ Supported |
| Positions | ✅ Primary | - | - | ✅ Supported |
| Tax Lots | ✅ Primary | - | - | ✅ Supported |
| Transactions | ✅ Primary | - | - | - |
| Balances | ✅ Primary | - | - | - |
| Performance | ✅ TWR/IRR | - | - | - |
| Cost Basis | ✅ Primary | - | - | ✅ Override |

**Fallback Logic:**
```typescript
async function getAccountData(accountId: string) {
  // Try BridgeFT first
  const bridgeData = await bridgeft.getAccount(accountId);
  if (bridgeData) return bridgeData;
  
  // Fallback to direct custodian
  const custodian = await getCustodianType(accountId);
  if (custodian === 'altruist') {
    return await altruist.getAccount(accountId);
  }
  
  // Final fallback to manual entry
  return await prisma.account.findUnique({ where: { id: accountId }});
}
```

---

## 5. Day-1 MVP vs Full Integration

### Day-1 MVP (Launch)

| Feature | Status | Notes |
|---------|--------|-------|
| Account sync | ✅ Required | Basic account info |
| Position sync | ✅ Required | Current holdings |
| Balance sync | ✅ Required | Cash + securities |
| Manual account entry | ✅ Required | Held-away assets |
| Tax lot sync | ⚠️ Nice-to-have | For tax features |
| Transaction history | ⚠️ Nice-to-have | For wash sales |
| Performance calcs | ❌ Later | Use BridgeFT's TWR |
| Webhooks | ❌ Later | Poll-based initially |

### Full Integration (90 Days)

| Feature | Status | Notes |
|---------|--------|-------|
| Tax lot sync | ✅ Required | Tax-loss harvesting |
| Transaction history | ✅ Required | Full audit trail |
| Realized G/L tracking | ✅ Required | Tax reporting |
| Performance calcs | ✅ Required | Client reports |
| Webhooks | ✅ Required | Real-time updates |
| Multi-custodian view | ✅ Required | Unified dashboard |
| Household aggregation | ✅ Required | Family views |

---

## 6. API Endpoints to Build

### Maven API Routes

```
/api/bridgeft/
├── connect          POST   - Initiate OAuth flow
├── callback         GET    - OAuth callback
├── sync             POST   - Trigger manual sync
├── status           GET    - Connection status
└── disconnect       DELETE - Remove connection

/api/advisor/
├── accounts         GET    - List all client accounts
├── accounts/[id]    GET    - Single account detail
├── positions        GET    - All positions (filterable)
├── tax-lots         GET    - Tax lot detail
├── transactions     GET    - Transaction history
└── performance      GET    - Performance metrics
```

### Sample Implementation

```typescript
// /api/bridgeft/sync/route.ts
export async function POST(req: Request) {
  const { advisorId } = await req.json();
  
  const connection = await prisma.bridgeFTConnection.findFirst({
    where: { user: { advisor: { id: advisorId }}}
  });
  
  if (!connection) {
    return Response.json({ error: 'No BridgeFT connection' }, { status: 400 });
  }
  
  // Fetch and sync all data
  const accounts = await bridgeft.getAccounts(connection.accessToken);
  for (const account of accounts) {
    await syncAccount(account);
    await syncPositions(account.id);
    await syncTaxLots(account.id);
  }
  
  // Update sync timestamp
  await prisma.bridgeFTConnection.update({
    where: { id: connection.id },
    data: { lastSyncedAt: new Date() }
  });
  
  return Response.json({ success: true, synced: accounts.length });
}
```

---

## 7. Security Considerations

### Token Storage
- All tokens encrypted at rest (AES-256)
- Tokens never logged or exposed in errors
- Rotation on suspected compromise

### Data Access
- Advisor can only see their linked accounts
- Client can only see their own data
- Audit log all data access

### Compliance
- SOC 2 Type II (BridgeFT certified)
- Data residency: US only
- Retention: Follow SEC requirements (6+ years)

---

## 8. Error Handling

```typescript
const BRIDGEFT_ERRORS = {
  401: 'Token expired - trigger reauth',
  403: 'Insufficient permissions - check advisor codes',
  404: 'Account not found - may be closed',
  429: 'Rate limited - implement backoff',
  500: 'BridgeFT service error - retry with backoff',
};

async function handleBridgeFTError(error: any) {
  const status = error.response?.status;
  
  if (status === 401) {
    // Trigger token refresh
    await refreshBridgeFTToken();
  } else if (status === 429) {
    // Exponential backoff
    await sleep(Math.pow(2, retryCount) * 1000);
  }
  
  // Log for monitoring
  console.error(`BridgeFT Error ${status}:`, error.message);
}
```

---

## 9. Monitoring & Alerts

### Health Checks
- Token expiry warning (< 1 hour)
- Sync staleness (> 24 hours)
- Error rate threshold (> 5%)

### Metrics to Track
- Sync duration
- Records processed
- Error count by type
- API latency

---

## 10. Cost Estimates

| Usage Tier | Monthly Cost | Notes |
|------------|--------------|-------|
| Startup (< 1000 accounts) | ~$500-1,000 | |
| Growth (1,000-5,000) | ~$1,000-2,500 | |
| Scale (5,000+) | Custom | Volume discounts |

**Break-even:** At 1% AUM fee, ~$5M AUM covers data costs.

---

## Appendix: BridgeFT Custodian Codes

| Custodian | Code | Notes |
|-----------|------|-------|
| Altruist | ALT | Primary |
| Schwab | SWB | Secondary |
| Fidelity | NFS | Future |
| Pershing | PER | Future |
| TD Ameritrade | TDA | Migrated to SWB |

---

*Last Updated: February 2026*
*Version: 1.0*
