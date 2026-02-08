export interface PortfolioHolding {
  ticker: string;
  weight: number; // percentage, e.g., 25 for 25%
  shares?: number;
  value?: number;
}

export interface FundData {
  ticker: string;
  name: string;
  type: 'ETF' | 'Mutual Fund';
  expenseRatio: number;
  aum: number; // in millions
  inceptionDate: string;
  category: string;
  annualizedReturn1Y?: number;
  annualizedReturn3Y?: number;
  annualizedReturn5Y?: number;
  volatility?: number;
  sharpeRatio?: number;
  beta?: number;
  meetsRequirements: boolean; // $100M+ AUM, 1+ year track record
}

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  expenseRatio: number;
  diversificationScore: number;
}

export interface Recommendation {
  currentHolding: FundData;
  recommendedHolding: FundData;
  reason: string;
  impact: {
    returnChange: number;
    volatilityChange: number;
    expenseChange: number;
  };
}

export interface ScenarioProjection {
  years: number[];
  percentile5: number[];
  percentile25: number[];
  percentile50: number[];
  percentile75: number[];
  percentile95: number[];
}

export interface StressTest {
  scenario: string;
  description: string;
  currentPortfolioImpact: number;
  optimizedPortfolioImpact: number;
}

export interface AnalysisResult {
  currentPortfolio: {
    holdings: (PortfolioHolding & FundData)[];
    metrics: PortfolioMetrics;
  };
  optimizedPortfolio: {
    holdings: (PortfolioHolding & FundData)[];
    metrics: PortfolioMetrics;
  };
  recommendations: Recommendation[];
  projections: {
    current: ScenarioProjection;
    optimized: ScenarioProjection;
  };
  stressTests: StressTest[];
  summary: string;
}
