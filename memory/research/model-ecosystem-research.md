# Maven AI Model Ecosystem Research

**Research Date:** February 11, 2026  
**Purpose:** Inform Maven's AI orchestration strategy and competitive moat

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Bittensor Subnet Map](#bittensor-subnet-map)
3. [LLM Provider Comparison](#llm-provider-comparison)
4. [Recommended Architecture for Maven's "Model Allocator"](#recommended-architecture)
5. [Cost Analysis](#cost-analysis)
6. [Integration Priority Ranking](#integration-priority-ranking)

---

## Executive Summary

Maven's competitive moat lies in **intelligent model orchestration** - routing queries to the optimal combination of:
- **Decentralized Bittensor subnets** (trading signals, financial data, forecasting)
- **Fast centralized providers** (Groq for latency-critical tasks)
- **Cost-optimized providers** (Chutes.ai, DeepSeek for bulk inference)
- **Specialized providers** (Perplexity for research, reasoning models for analysis)

**Key Findings:**
- **Chutes.ai (Subnet 64)** operates at ~85% lower cost than AWS - primary inference provider
- **Taoshi/Vanta (Subnet 8)** provides institutional-grade trading signals
- **BitQuant (Subnet 15)** offers DeFi analysis via natural language
- **Multiple specialized subnets** provide forecasting, sentiment, and market data
- **Groq** offers 500-1000+ TPS - ideal for real-time UX
- **Together.ai/Fireworks** provide broad model selection with OpenAI compatibility

---

## Bittensor Subnet Map

### 🎯 HIGH PRIORITY - Financial/Trading Subnets

| Subnet | Name | What It Does | Maven Use Case | API Status |
|--------|------|--------------|----------------|------------|
| **SN8** | **Vanta (Taoshi)** | Decentralized prop trading - crowdsources AI-driven trading signals. Miners compete on risk-adjusted returns (Sharpe, Omega, drawdown). Top 25% pass 60-day challenge to earn continuous rewards. Produces "super-strategy" blending best performers. | **PRIMARY** - Core trading signal source. Integrate their aggregated signal feed for portfolio recommendations. Access via Glitch Financial or direct API. | ✅ Available via Taoshi/Glitch |
| **SN15** | **BitQuant** | Decentralized AI framework for quantitative DeFi analysis. Natural language queries for portfolio analysis, risk assessment, trend analysis, strategy backtesting. 4.7M beta sessions, 41M messages. | **HIGH** - Natural language financial queries. "What's my liquidation risk?" "Analyze this wallet's allocation." | ✅ API at bitquant.io |
| **SN55** | **Precog** | High-frequency Bitcoin price forecasting (5-min intervals). Miners predict BTC price 1 hour ahead + high/low range. Powered by Coin Metrics data. | **MEDIUM** - Short-term BTC price signals for trading recommendations | ✅ Dashboard + API planned |
| **SN123** | **MANTIS** | AI-driven financial forecasting. Uses XGBoost + salience algorithms for multi-asset predictions. Continuous signal refinement. | **MEDIUM** - Alternative/complementary trading signals | ✅ Open source |
| **SN53** | **Efficient Frontier** | Optimizes crypto trading strategies using ML and live trading data. SignalPlus team. | **MEDIUM** - Strategy optimization layer | Research needed |
| **SN50** | **Synth** | Generates synthetic price data capturing full probability distributions for AI trading. Mode Network. | **LOW** - Training data for internal models | Research needed |
| **SN79** | **τaos** | Simulates decentralized financial markets. Incentivizes AI trading strategies and risk-managed algorithm development. | **LOW** - Backtesting/simulation environment | Research needed |
| **SN41** | **Almanac** | Sports predictions marketplace - but methodology applicable to event prediction | **EXPLORATORY** - Event-driven trading | Limited |
| **SN88** | **Investing** | Mobius Fund - optimizes staking strategies for crypto/tradfi via performance scoring | **MEDIUM** - Staking optimization for yield strategies | Research needed |

### 🧠 HIGH PRIORITY - Inference & Intelligence Subnets

| Subnet | Name | What It Does | Maven Use Case | API Status |
|--------|------|--------------|----------------|------------|
| **SN64** | **Chutes** | **#1 Inference Provider** - Serverless AI compute on Bittensor. ~85% cheaper than AWS. 100B+ tokens/day. First to host DeepSeek V3. OpenRouter's top provider. TEE (Trusted Execution) support. | **PRIMARY** - Default inference backend. OpenAI-compatible API. Process all standard LLM queries through Chutes. | ✅ OpenAI-compatible API |
| **SN1** | **Apex** | Improves LLM inference via agentic workflows. Generates fine-tuning data at scale. Macrocosmos. | **MEDIUM** - Agent orchestration improvements | Research needed |
| **SN120** | **Affine** | Decentralized RL platform. Continuously improves AI models through competition. Connects to Chutes for hosting. | **LOW** - Long-term model improvement | Via Chutes |
| **SN56** | **Gradients** | Simplifies AI training on Bittensor. Rayon Labs. | **LOW** - If custom model training needed | Research needed |

### 📊 MEDIUM PRIORITY - Data & Research Subnets

| Subnet | Name | What It Does | Maven Use Case | API Status |
|--------|------|--------------|----------------|------------|
| **SN22** | **Desearch** | AI-powered analysis of Twitter, Reddit, Google. Miners scrape/index multiple databases, LLM summarizes. 40% summary, 50% Twitter, 10% search scoring. | **HIGH** - Sentiment analysis, social signals, market research. Query "What's the sentiment on $BTC?" | ✅ Available |
| **SN6** | **Numinous** | Decentralized forecasting network. AI agents compete as "superforecasters" on events. Open-source, composable predictions. | **MEDIUM** - Event probability forecasting (macro events, elections, market events) | ✅ API planned |
| **SN13** | **Data Universe** | Decentralized data storage/collection for Bittensor. Macrocosmos. | **LOW** - Data infrastructure | Infrastructure |
| **SN42** | **Gopher** | Scrapes, structures, streams real-time data from multiple sources into AI-ready datasets. | **MEDIUM** - Real-time data feeds | Research needed |
| **SN45** | **Talisman AI** | Mining live crypto signals (social, chain, market) for Talisman wallet's trading insights | **MEDIUM** - Alternative signal source | Research needed |
| **SN107** | **Tiger Alpha** | Real-time, verifiable crypto market data via AI research agents | **MEDIUM** - Market data verification | Research needed |

### 🔐 LOWER PRIORITY - Infrastructure & Specialized

| Subnet | Name | What It Does | Maven Use Case |
|--------|------|--------------|----------------|
| **SN7** | SubVortex | Decentralized infrastructure - subtensor nodes, routing | Infrastructure support |
| **SN12** | ComputeHorde | Trusted GPU compute network | Compute scaling |
| **SN51** | Lium | GPU rental marketplace | Cost optimization |
| **SN27** | Nodexo | GPU cloud marketplace | Alternative compute |
| **SN39** | Basilica | Trustless GPU compute with verification | Secure compute |
| **SN2** | DSperse | Zero-knowledge proving for verifiable inference | Privacy features |
| **SN70** | Vericore | Large-scale fact-checking with evidence | Content verification |
| **SN32** | It's AI | AI-generated content detection | Trust & safety |
| **SN34** | BitMind | AI-generated image detection | Trust & safety |
| **SN40** | Chunking | Smart chunking for RAG | RAG optimization |

### 📋 Complete Subnet Reference (All 128 Subnets)

<details>
<summary>Click to expand full subnet list</summary>

| # | Name | Team | Description |
|---|------|------|-------------|
| 1 | Apex | Macrocosmos | LLM inference via agentic workflows |
| 2 | DSperse | Inference Labs | Zero-knowledge proving network |
| 3 | Templar | Covenant AI | Decentralized AI training |
| 4 | Targon | Manifold Labs | Multimodal processing |
| 5 | Hone | Manifold/Latent | Hierarchical AI training for AGI |
| 6 | Numinous | Numinous Labs | Forecasting network |
| 7 | SubVortex | SubVortex | Infrastructure/routing |
| 8 | Vanta | Taoshi | Prop trading signals |
| 9 | IOTA | Macrocosmos | LLM pre-training |
| 10 | Swap | TaoFi | Cross-chain DEX |
| 11 | Dippy Studio | Impel | Generative media platform |
| 12 | ComputeHorde | Backend Devs | GPU compute network |
| 13 | Data Universe | Macrocosmos | Data storage |
| 14 | TAO Hash | Latent | Bitcoin mining redirect |
| 15 | BitQuant | OpenGradient | DeFi quantitative analysis |
| 16 | BitAds | BitAds | Pay-per-sale advertising |
| 17 | Gen 404 | 404 | 3D world/game generation |
| 18 | Zeus | Orpheus AI | Environmental forecasting |
| 20 | Bounty Hunter | Team Rizzo | AI bounty competitions |
| 21 | Any-to-Any | Omega Labs | Multimodal AI |
| 22 | Desearch | Datura AI | Twitter/Reddit/Google analysis |
| 23 | Trishool | Trishool | AI safety testing |
| 24 | Quasar | SILX Labs | Near-infinite context LLMs |
| 25 | Mainframe | Macrocosmos | Protein folding |
| 26 | Kinitro | ThreeTau | Robotic intelligence |
| 27 | Nodexo | Nodexo | GPU cloud marketplace |
| 29 | AI-ASSeSS | AI-ASSeSS | Collaborative model training |
| 30 | Wahoot | Wahoo Predict | Real-time prediction market |
| 32 | It's AI | It's AI | AI content detection |
| 33 | ReadyAI | Afterparty | Dialogue dataset |
| 34 | BitMind | BitMind | AI image detection |
| 35 | Cartha | 0xMarkets | DEX liquidity engine |
| 36 | Web Agents | Autoppia | Web automation agents |
| 37 | Aurelius | Aurelius Labs | AI alignment network |
| 39 | Basilica | Covenant AI | Trustless GPU marketplace |
| 40 | Chunking | Inference | Smart RAG chunking |
| 41 | Almanac | Almanac | Sports predictions |
| 42 | Gopher | Gopher Lab | Real-time data scraping |
| 43 | Graphite | Graphite AI | Graphical problems |
| 44 | Score | Score Tech | Football predictions |
| 45 | Talisman AI | Rizzo/Talisman | Crypto signals for wallet |
| 46 | RESI | Resi Labs | Real estate database |
| 48 | Quantum Compute | qBittensor | Quantum computing access |
| 50 | Synth | Mode Network | Synthetic price data |
| 51 | Lium | Datura | GPU rental platform |
| 52 | Dojo | Tensorplex | Multi-modal training data |
| 53 | Efficient Frontier | SignalPlus | Trading strategy optimization |
| 54 | MIID | Yanez | Synthetic identity for compliance |
| 55 | Precog | Coin Metrics | BTC price forecasting |
| 56 | Gradients | Rayon Labs | Simplified AI training |
| 57 | Sparket | Sparket | Sports prediction marketplace |
| 58 | Dippy Speech | Impel | Speech model for roleplay |
| 59 | BabelBit | BabelBit Ltd | Real-time speech translation |
| 60 | Bitsec | Bitsec | Code/smart contract security |
| 61 | RedTeam | Innerworks | Cybersecurity challenges |
| 62 | Ridges AI | Ridges AI | Software agent marketplace |
| 63 | Quantum Innovate | qBittensor | Quantum circuit simulation |
| 64 | Chutes | Rayon Labs | **Serverless AI inference** |
| 65 | TAO Private Network | Taofu | Decentralized VPN |
| 66 | AlphaCore | AlphaCore | DevOps automation |
| 67 | Tenex | Tenexium | Margin trading platform |
| 68 | NOVA | Metanova Labs | Drug discovery |
| 70 | Vericore | dFusion AI | Fact-checking |
| 71 | Leadpoet | Leadpoet | Sales lead generation |
| 72 | StreetVision | NATIX | Autonomous driving data |
| 73 | Metahash | Fxintegral | Alpha-to-META swaps |
| 74 | Gittensor | Gittensor | Developer rewards |
| 75 | Hippius | Nerve Lab | Decentralized cloud storage |
| 76 | Safe Scan | Safe Scan AI | Cancer screening |
| 77 | Liquidity | Creative Builds | Liquidity provisioning |
| 78 | Loosh | Loosh | Machine consciousness |
| 79 | τaos | τaos | Financial market simulation |
| 80 | Dogelayer | Dogelayer | BTC+Doge+AI mining |
| 81 | Grail | Covenant AI | Distributed AI training |
| 83 | CliqueAI | TopTensor | NP-hard graph problems |
| 84 | ChipForge | Tatsu | AI chip design |
| 85 | Vidaio | VIDAIO | Video upscaling |
| 88 | Investing | Mobius Fund | Staking optimization |
| 89 | InfiniteHash | Backend Devs | Bitcoin mining pool |
| 91 | Tensorprox | Shugo | DDoS mitigation |
| 93 | Bitcast | Bitcast | Creator rewards |
| 94 | Bitsota | Alveus Labs | AI model search engine |
| 96 | FLOCK OFF | FLock.io | Edge AI datasets |
| 97 | FlameWire | UnitOne Labs | Multi-chain RPC gateway |
| 98 | Forever Money | Unknown | DEX liquidity manager |
| 99 | Neza | Neza | Video generation |
| 100 | Platform | Cortex | Collaborative AI research |
| 106 | Liquidity Provisioning | VoidAI | Cross-chain liquidity |
| 107 | Tiger Alpha | Tiger Royalties | Crypto market data |
| 111 | oneoneone | oneoneone | User-generated AI data |
| 112 | minotaur | Unknown | DEX aggregator |
| 116 | TaoLend | XpenLab | TAO lending protocol |
| 117 | BrainPlay | ShiftLayer | AI game benchmarking |
| 118 | HODL ETF | TrustedStake | TAO staking rewards |
| 120 | Affine | Affine | RL model improvement |
| 121 | sundae_bar | sundae_bar | AI agent marketplace |
| 122 | Bitrecs | Bitrecs | E-commerce recommendations |
| 123 | MANTIS | Barbarian | Financial forecasting |
| 124 | Swarm | Swarm | Drone autopilot |
| 128 | ByteLeap | ByteLeap | Cloud AI training |

</details>

---

## LLM Provider Comparison

### Primary Inference Providers

| Provider | OpenAI Compatible | Best Models | Latency | Pricing (per 1M tokens) | Best For |
|----------|-------------------|-------------|---------|------------------------|----------|
| **Chutes.ai** | ✅ Yes | DeepSeek V3/R1, Llama, Qwen | Good | ~85% cheaper than AWS | **Primary inference** - cost optimized |
| **Groq** | ✅ Yes | GPT-OSS, Llama 4, Qwen3, Kimi K2 | **Fastest** (200-1000 TPS) | $0.075-$3.00 input | **Real-time UX** - speed critical |
| **Together.ai** | ✅ Yes | All major models, DeepSeek, Llama, Qwen | Fast | $0.06-$3.50 | **Model variety** - fine-tuning |
| **Fireworks.ai** | ✅ Yes | DeepSeek V3, GLM, Kimi K2, Qwen | Fast | $0.10-$1.35 input | **Balanced** - good pricing + speed |
| **DeepSeek Direct** | ✅ Yes | DeepSeek V3.2, Reasoner | Good | $0.028 (cached) - $0.42 | **Cheapest reasoning** |

### Detailed Provider Analysis

#### 🚀 Chutes.ai (Bittensor Subnet 64)
**Status:** PRIMARY RECOMMENDATION

- **What:** Decentralized serverless AI compute powered by Bittensor
- **Scale:** 100B+ tokens/day, 3T tokens/month
- **Cost:** ~85% lower than AWS
- **Models:** DeepSeek V3/R1, Llama, Qwen, and many more
- **API:** OpenAI-compatible endpoint
- **Unique:** TEE (Trusted Execution Environments) for privacy
- **Integration:** `pip install chutes` or OpenAI SDK with custom base_url

```python
# Chutes Example
from openai import OpenAI
client = OpenAI(
    api_key="CHUTES_API_KEY",
    base_url="https://api.chutes.ai/v1"
)
```

**Maven Use:** Default inference backend for all standard queries

---

#### ⚡ Groq
**Status:** HIGH PRIORITY - Speed Critical

| Model | Speed (TPS) | Input $/1M | Output $/1M |
|-------|-------------|------------|-------------|
| GPT OSS 20B | 1,000 | $0.075 | $0.30 |
| GPT OSS 120B | 500 | $0.15 | $0.60 |
| Kimi K2 1T | 200 | $1.00 | $3.00 |
| Llama 4 Scout | 594 | $0.11 | $0.34 |
| Llama 4 Maverick | 562 | $0.20 | $0.60 |
| Qwen3 32B | 662 | $0.29 | $0.59 |
| Llama 3.3 70B | 394 | $0.59 | $0.79 |
| Llama 3.1 8B | 840 | $0.05 | $0.08 |

**Extras:**
- 50% Batch API discount
- Prompt caching (50% off cached tokens)
- Built-in web search ($5-8/1K requests)
- Code interpreter ($0.18/hour)

**Maven Use:** Real-time chat, speed-critical paths, user-facing responses

---

#### 🤝 Together.ai
**Status:** HIGH PRIORITY - Model Variety

| Model | Input $/1M | Output $/1M |
|-------|------------|-------------|
| Llama 4 Maverick | $0.27 | $0.85 |
| Llama 3.3 70B | $0.88 | $0.88 |
| Llama 3.1 405B | $3.50 | $3.50 |
| DeepSeek-R1-0528 | $3.00 | $7.00 |
| DeepSeek-V3.1 | $0.60 | $1.70 |
| GPT-OSS 120B | $0.15 | $0.60 |
| GPT-OSS 20B | $0.05 | $0.20 |
| Qwen3 235B | $0.20 | $0.60 |
| Kimi K2 Instruct | $1.00 | $3.00 |
| Mistral Small 3 | $0.10 | $0.30 |

**Embeddings:**
- BGE-Base: $0.01/1M tokens
- BGE-Large: $0.02/1M tokens
- Multilingual e5: $0.02/1M tokens

**Extras:**
- Whisper transcription: $0.0015/minute
- Rerank models: $0.10/1M tokens
- Image generation (FLUX): $0.0027-$0.08/image
- Video generation: $0.14-$2.50/video

**Maven Use:** Fine-tuning, embeddings, diverse model access

---

#### 🔥 Fireworks.ai
**Status:** MEDIUM PRIORITY - Balanced

| Model Category | Pricing |
|----------------|---------|
| < 4B params | $0.10/1M |
| 4B-16B params | $0.20/1M |
| > 16B params | $0.90/1M |
| DeepSeek V3 | $0.56 in / $1.68 out |
| DeepSeek R1 | $1.35 in / $5.40 out |
| Kimi K2 | $0.60 in / $2.50 out |
| Qwen3 235B | $0.22 in / $0.88 out |

**Features:**
- OpenAI SDK compatible
- 50% off cached tokens
- 50% off batch inference
- Structured outputs (JSON schema)
- Function calling
- Vision models

**Maven Use:** Backup inference, structured outputs

---

#### 🔍 Perplexity API
**Status:** MEDIUM PRIORITY - Research

| API | Pricing |
|-----|---------|
| **Sonar** | $1/1M in, $1/1M out + $5-12/1K requests |
| **Sonar Pro** | $3/1M in, $15/1M out + $6-14/1K requests |
| **Sonar Reasoning Pro** | $2/1M in, $8/1M out + $6-14/1K requests |
| **Deep Research** | $2/1M in, $8/1M out, $2/1M citations, $3/1M reasoning |
| **Search API** | $5/1K requests |
| **Tool: web_search** | $0.005/invocation |
| **Tool: fetch_url** | $0.0005/invocation |

**Maven Use:** Deep research queries, market research with citations

---

#### 🧠 DeepSeek Direct
**Status:** COST OPTIMIZATION

| Model | Cache Hit | Cache Miss | Output |
|-------|-----------|------------|--------|
| DeepSeek-V3.2 (Chat) | $0.028 | $0.28 | $0.42 |
| DeepSeek-V3.2 (Reasoner) | $0.028 | $0.28 | $0.42 |

**Features:**
- 128K context
- JSON output
- Tool calls
- Cheapest reasoning model

**Maven Use:** Heavy reasoning tasks, cost-sensitive batch processing

---

#### 🌟 Mistral
**Status:** SPECIALIZED

- **Le Chat Free:** Basic access to Mistral models
- **Le Chat Pro:** Enhanced limits, Mistral Vibe IDE
- **API:** Enterprise pricing (contact sales)

**Maven Use:** European compliance, specialized tasks

---

#### 🏢 Cohere
**Status:** ENTERPRISE

- **North:** All-in-one AI platform
- **Compass:** Intelligent search system
- Pricing: Enterprise custom only

**Maven Use:** If enterprise features required

---

## Recommended Architecture

### Maven Model Allocator v1.0

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER QUERY                                    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    QUERY CLASSIFIER                                  │
│  (Fast model: Llama 3.1 8B on Groq - $0.05/1M, 840 TPS)            │
│  Determines: query_type, urgency, complexity, data_needs            │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ REAL-TIME PATH  │  │  ANALYSIS PATH  │  │  RESEARCH PATH  │
│                 │  │                 │  │                 │
│ • Chat UI       │  │ • Portfolio     │  │ • Deep research │
│ • Quick Q&A     │  │ • Strategy      │  │ • Market intel  │
│ • Alerts        │  │ • Risk analysis │  │ • Due diligence │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     GROQ        │  │    CHUTES       │  │   PERPLEXITY    │
│ Speed: 500-1K   │  │ Cost: -85%      │  │ + DESEARCH      │
│ TPS             │  │ vs AWS          │  │ (citations)     │
│                 │  │                 │  │                 │
│ Models:         │  │ Models:         │  │ + BitQuant      │
│ • GPT-OSS 20B   │  │ • DeepSeek V3   │  │ (DeFi data)     │
│ • Llama 4       │  │ • DeepSeek R1   │  │                 │
│ • Qwen3 32B     │  │ • Qwen3         │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └──────────┬─────────┴──────────┬─────────┘
                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA ENRICHMENT LAYER                             │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   SN8        │  │   SN15       │  │   SN55       │              │
│  │   VANTA      │  │   BITQUANT   │  │   PRECOG     │              │
│  │   Trading    │  │   DeFi       │  │   BTC Price  │              │
│  │   Signals    │  │   Analysis   │  │   Forecast   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   SN22       │  │   SN6        │  │   SN123      │              │
│  │   DESEARCH   │  │   NUMINOUS   │  │   MANTIS     │              │
│  │   Social     │  │   Event      │  │   Financial  │              │
│  │   Sentiment  │  │   Forecasts  │  │   Forecasts  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESPONSE SYNTHESIZER                              │
│  (Chutes - DeepSeek V3 or appropriate model based on task)          │
│  Combines: LLM response + data enrichment + trading signals         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER RESPONSE                                     │
│  + Confidence score  + Data sources  + Action recommendations       │
└─────────────────────────────────────────────────────────────────────┘
```

### Routing Logic

```python
class ModelAllocator:
    def route(self, query: str, context: dict) -> ProviderConfig:
        classification = self.classify(query)  # Fast Groq call
        
        if classification.urgency == "realtime":
            # Sub-second response needed
            return ProviderConfig(
                provider="groq",
                model="llama-3.1-8b-instant" if classification.complexity == "low" 
                      else "qwen3-32b",
                enrich_with=[]
            )
        
        elif classification.type == "trading_decision":
            # Trading/investment query
            return ProviderConfig(
                provider="chutes",
                model="deepseek-r1",  # Reasoning for decisions
                enrich_with=["sn8_vanta", "sn55_precog", "sn123_mantis"]
            )
        
        elif classification.type == "portfolio_analysis":
            # DeFi/portfolio query
            return ProviderConfig(
                provider="chutes",
                model="deepseek-v3",
                enrich_with=["sn15_bitquant", "sn8_vanta"]
            )
        
        elif classification.type == "market_research":
            # Research with citations needed
            return ProviderConfig(
                provider="perplexity",
                model="sonar-pro",
                enrich_with=["sn22_desearch", "sn6_numinous"]
            )
        
        else:
            # Default path
            return ProviderConfig(
                provider="chutes",
                model="deepseek-v3",
                enrich_with=self.select_enrichment(classification)
            )
```

---

## Cost Analysis

### Estimated Monthly Costs (10,000 active users)

| Component | Queries/Month | Tokens/Query | Cost/1M | Monthly Cost |
|-----------|---------------|--------------|---------|--------------|
| **Classification (Groq)** | 1,000,000 | 500 | $0.05 | $25 |
| **Realtime (Groq)** | 500,000 | 2,000 | $0.30 avg | $300 |
| **Analysis (Chutes)** | 400,000 | 5,000 | $0.15 avg | $300 |
| **Research (Perplexity)** | 50,000 | 3,000 | $5/1K req | $250 |
| **Reasoning (DeepSeek)** | 50,000 | 10,000 | $0.28 in/$0.42 out | $350 |
| **Bittensor Signals** | - | - | Network fees | $200 |
| **TOTAL** | | | | **~$1,425/mo** |

### Cost Comparison vs. Pure OpenAI

| Scenario | Maven Stack | OpenAI GPT-4 | Savings |
|----------|-------------|--------------|---------|
| 1M queries/month | ~$1,400 | ~$30,000 | **95%** |
| Per query average | $0.0014 | $0.03 | **95%** |

### Chutes vs. Traditional Cloud

| Provider | Cost/1M tokens | vs Chutes |
|----------|----------------|-----------|
| Chutes (DeepSeek V3) | ~$0.15-0.30 | Baseline |
| AWS Bedrock (Claude) | $3-15 | 10-50x more |
| OpenAI GPT-4 | $10-30 | 30-100x more |
| Azure OpenAI | $10-30 | 30-100x more |

---

## Integration Priority Ranking

### Phase 1: Foundation (Week 1-2)
**Goal:** Core inference working

1. **Chutes.ai Integration** ⭐⭐⭐⭐⭐
   - Primary inference backend
   - OpenAI-compatible, drop-in replacement
   - Setup: API key + base_url change
   - Models: DeepSeek V3, R1, Llama, Qwen

2. **Groq Integration** ⭐⭐⭐⭐⭐
   - Speed-critical path
   - User-facing responses
   - Setup: API key
   - Models: Llama 3.1 8B (classifier), Qwen3 32B

### Phase 2: Data Enrichment (Week 3-4)
**Goal:** Financial intelligence layer

3. **SN8 Vanta/Taoshi** ⭐⭐⭐⭐⭐
   - Trading signals
   - Risk-adjusted returns
   - API via Glitch Financial or direct

4. **SN15 BitQuant** ⭐⭐⭐⭐⭐
   - DeFi analysis
   - Portfolio queries
   - Natural language interface

5. **SN22 Desearch** ⭐⭐⭐⭐
   - Social sentiment
   - Twitter/Reddit analysis
   - Market research

### Phase 3: Forecasting (Week 5-6)
**Goal:** Predictive intelligence

6. **SN55 Precog** ⭐⭐⭐⭐
   - BTC price forecasting
   - Short-term signals
   - Coin Metrics data

7. **SN6 Numinous** ⭐⭐⭐⭐
   - Event probability
   - Macro forecasting
   - Superforecaster network

8. **SN123 MANTIS** ⭐⭐⭐
   - Multi-asset forecasting
   - Alternative signals
   - XGBoost-based

### Phase 4: Advanced (Week 7-8)
**Goal:** Competitive differentiation

9. **Perplexity API** ⭐⭐⭐
   - Deep research
   - Citation-backed analysis
   - Pro search for complex queries

10. **Together.ai** ⭐⭐⭐
    - Embeddings (RAG)
    - Fine-tuning
    - Model variety

11. **SN120 Affine** ⭐⭐
    - Model improvement
    - RL optimization
    - Long-term capability building

### Future Exploration

| Subnet/Provider | Use Case | Priority |
|-----------------|----------|----------|
| SN42 Gopher | Real-time data feeds | Medium |
| SN45 Talisman AI | Crypto signals | Medium |
| SN88 Investing | Staking optimization | Medium |
| SN79 τaos | Strategy simulation | Low |
| SN50 Synth | Training data | Low |
| Fireworks | Backup inference | Low |
| Cohere | Enterprise features | Low |

---

## Technical Integration Notes

### OpenAI-Compatible Providers

All of these work with the standard OpenAI SDK:

```python
from openai import OpenAI

# Chutes
chutes = OpenAI(api_key="...", base_url="https://api.chutes.ai/v1")

# Groq
groq = OpenAI(api_key="...", base_url="https://api.groq.com/openai/v1")

# Together
together = OpenAI(api_key="...", base_url="https://api.together.xyz/v1")

# Fireworks
fireworks = OpenAI(api_key="...", base_url="https://api.fireworks.ai/inference/v1")

# DeepSeek
deepseek = OpenAI(api_key="...", base_url="https://api.deepseek.com")
```

### Bittensor Subnet Integration

For Bittensor subnets, integration typically involves:

1. **Direct API** (if available) - BitQuant, Desearch
2. **TAO staking** for premium access
3. **Validator/Miner setup** for deeper integration

```python
# Example: BitQuant Query
import requests

response = requests.post(
    "https://api.bitquant.io/agent/run",
    json={"query": "What's my portfolio risk exposure?"},
    headers={"Authorization": "Bearer ..."}
)
```

---

## Conclusion

Maven's competitive moat is **intelligent orchestration** across:

1. **Cost**: Chutes.ai at 85% below AWS prices
2. **Speed**: Groq at 500-1000 TPS for real-time UX
3. **Intelligence**: Bittensor subnets for trading signals, forecasting, sentiment
4. **Flexibility**: Multiple providers for redundancy and optimization

The Model Allocator architecture routes each query to the optimal combination of providers and data sources, creating a system that's cheaper, faster, and smarter than any single provider could offer.

**Total Integration Effort:** ~8 weeks
**Estimated Monthly Costs:** ~$1,400 for 10K users (95% cheaper than OpenAI)
**Competitive Advantage:** Decentralized intelligence + cost optimization + speed

---

*Research compiled by OpenClaw AI | February 2026*
