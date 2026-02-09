# API Patterns with Fallback

## Basic Fetch with Error Handling

```typescript
async function fetchData<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, {
      cache: 'no-store', // Avoid stale data
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return fallback;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    return fallback;
  }
}
```

---

## Multi-Source with Fallback Chain

```typescript
async function fetchWithFallback<T>(
  sources: Array<() => Promise<T | null>>,
  fallback: T
): Promise<{ data: T; source: string; isLive: boolean }> {
  for (let i = 0; i < sources.length; i++) {
    try {
      const result = await sources[i]();
      if (result !== null) {
        return { data: result, source: `source-${i}`, isLive: true };
      }
    } catch (error) {
      console.error(`Source ${i} failed:`, error);
    }
  }
  return { data: fallback, source: 'fallback', isLive: false };
}

// Usage:
const { data, isLive } = await fetchWithFallback([
  () => fetchFromFMP(symbol),
  () => fetchFromYahoo(symbol),
], FALLBACK_PRICES[symbol]);
```

---

## Client-Side with Loading/Error States

```typescript
const [data, setData] = useState<DataType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isLive, setIsLive] = useState(true);

useEffect(() => {
  async function load() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      setData(result.data);
      setIsLive(result.isLive ?? true);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      setData(FALLBACK_DATA);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }
  load();
}, []);
```

---

## API Route with Graceful Degradation

```typescript
// app/api/data/route.ts
import { NextResponse } from 'next/server';

const FALLBACK_DATA = { /* ... */ };

export async function GET() {
  let data = null;
  let isLive = false;
  let source = 'fallback';

  // Try primary source
  try {
    const primary = await fetch('https://api.primary.com/data');
    if (primary.ok) {
      data = await primary.json();
      isLive = true;
      source = 'primary';
    }
  } catch (e) {
    console.error('Primary failed:', e);
  }

  // Try secondary source
  if (!data) {
    try {
      const secondary = await fetch('https://api.secondary.com/data');
      if (secondary.ok) {
        data = await secondary.json();
        isLive = true;
        source = 'secondary';
      }
    } catch (e) {
      console.error('Secondary failed:', e);
    }
  }

  // Use fallback
  if (!data) {
    data = FALLBACK_DATA;
  }

  return NextResponse.json({
    data,
    isLive,
    source,
    timestamp: new Date().toISOString(),
  });
}
```

---

## Display Component with Live/Delayed Indicator

```tsx
interface DataDisplayProps {
  data: DataType;
  isLive: boolean;
  lastUpdate: Date | null;
}

function DataDisplay({ data, isLive, lastUpdate }: DataDisplayProps) {
  return (
    <div className="relative">
      {!isLive && (
        <span className="absolute top-2 right-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
          Delayed
        </span>
      )}
      
      <div>{/* data display */}</div>
      
      <span className="text-xs text-gray-500">
        {isLive 
          ? `Updated ${lastUpdate?.toLocaleTimeString()}`
          : 'Market close'
        }
      </span>
    </div>
  );
}
```
