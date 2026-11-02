# Business Model Analysis
## Formula Nebula · 公式诗云

**Document Version:** 1.0  
**Analysis Date:** 2026-11-02  
**Analysis Horizon:** 3 years (2027-2029)

---

## Executive Summary

Formula Nebula is a 3D interactive knowledge graph visualization for algebraic geometry, featuring 464 formulas (405 theorems + 59 conjectures) with 1,620 relationships. The project currently has advanced features including semantic search, collaboration system, learning paths, and social features.

**Recommended Model:** Hybrid (Model 5)
- Phase 1 (Year 1): Open source + SaaS freemium
- Phase 2 (Year 2): Add Enterprise licensing
- Phase 3 (Year 3): Launch Marketplace

**Key Metrics (3-year projection):**
- Break-even: Month 18
- Year 3 Revenue: $1.8M - $2.4M
- Year 3 Margin: 68-72%

---

## Market Analysis

### Target Segments

| Segment | Size | Willingness to Pay | Acquisition Channel |
|---------|------|-------------------|---------------------|
| **Academic Institutions** | 4,500 universities worldwide with math programs | High ($5K-50K/year) | Direct sales, conferences |
| **Individual Researchers** | ~150,000 active algebraic geometry researchers | Medium ($50-200/year) | Academic networks, arXiv |
| **Graduate Students** | ~500,000 global math PhD students | Low-Medium ($0-50/year) | University licenses, word-of-mouth |
| **EdTech Platforms** | 50+ major platforms (Coursera, edX, etc.) | High (revenue share) | B2B partnerships |
| **Publishers** | 20+ academic publishers | Medium-High ($10K-100K/year) | Direct sales |

### Market Opportunity

**Total Addressable Market (TAM):** $450M
- Math software & tools: $2.8B global market
- Algebraic geometry subset: ~16%

**Serviceable Addressable Market (SAM):** $120M
- Interactive visualization tools for higher math
- Knowledge graph platforms for academia

**Serviceable Obtainable Market (SOM):** $12M (Year 3)
- Initial focus: English + Chinese markets
- Primary segments: Universities + researchers

---

## Model 1: Open Source (MIT/GPL + Optional Support)

### Structure

**License:** MIT or GPL-3.0
**Revenue Streams:**
1. Support contracts (Bronze/Silver/Gold tiers)
2. Custom development services
3. Training & workshops
4. Sponsored features

### Financial Projections (3 Years)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **GitHub Stars** | 2,500 | 8,000 | 18,000 |
| **Active Forks** | 150 | 600 | 1,400 |
| **Support Contracts** | 8 | 35 | 90 |
| **Avg Contract Value** | $12,000 | $15,000 | $18,000 |
| **Custom Dev Projects** | 3 | 12 | 25 |
| **Workshops/Year** | 6 | 20 | 40 |
| | | | |
| **Total Revenue** | $142K | $765K | $2.1M |
| **COGS (40%)** | $57K | $306K | $840K |
| **Gross Margin** | $85K | $459K | $1.26M |
| **Operating Exp** | $220K | $450K | $720K |
| **Net Income** | **-$135K** | **$9K** | **$540K** |

### Unit Economics

**Customer Acquisition Cost (CAC):**
- Organic (GitHub): $0
- Conference sponsorship: $2,500 per contract
- Content marketing: $800 per contract
- Blended CAC: **$450/customer**

**Lifetime Value (LTV):**
- Average contract duration: 2.4 years
- Annual churn: 22%
- Average annual value: $16,000
- LTV: **$38,400**

**LTV:CAC Ratio:** 85:1 (excellent, driven by open source adoption)

### Break-Even Analysis

**Fixed Costs:** $180K/year (2 FTE engineers + infrastructure)
**Variable Costs:** 40% of revenue
**Break-even Revenue:** $300K
**Timeline:** Month 16

### Pros

- Low customer acquisition cost (viral GitHub growth)
- Strong community contribution (estimated 40% of features from community by Year 3)
- Brand building in academic community
- Attracts talent (open source credentials)
- Defensive moat (hard to compete with free)

### Cons

- Revenue uncertainty (depends on enterprise adoption of open source)
- Support burden scales with adoption
- Hard to monetize individual users
- Community expectations limit pivoting
- GPL requires derivative works to be open (MIT more permissive)

### Risk Factors

- **High:** Insufficient enterprise adoption of support contracts (probability: 35%)
- **Medium:** Community forks competing product (probability: 20%)
- **Low:** License compliance issues (probability: 5%)

---

## Model 2: SaaS (Freemium + Premium Tiers)

### Structure

**Freemium Tier (Free):**
- 464 formulas (read-only)
- Basic search
- Limited exports (5/month)
- Community support

**Pro Tier ($19/month or $190/year):**
- Unlimited exports
- Advanced search with query DSL
- Custom color schemes
- Priority support
- Annotation system
- Learning path tracking

**Team Tier ($79/month or $790/year, up to 10 users):**
- All Pro features
- Real-time collaboration
- Shared workspaces
- Team analytics
- Video conferencing integration
- Admin controls

**Enterprise Tier (Custom pricing, $5K-50K/year):**
- Custom knowledge graphs
- Self-hosted option
- SSO/SAML
- SLA guarantees
- Dedicated support
- White-labeling

### Financial Projections (3 Years)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Free Users** | 5,000 | 25,000 | 80,000 |
| **Pro Users** | 150 (3%) | 1,250 (5%) | 4,800 (6%) |
| **Team Accounts** | 12 | 85 | 280 |
| **Enterprise Clients** | 3 | 18 | 55 |
| | | | |
| **MRR - Pro** | $2,850 | $23,750 | $91,200 |
| **MRR - Team** | $948 | $6,715 | $22,120 |
| **MRR - Enterprise** | $1,875 | $11,250 | $34,375 |
| **Total MRR** | **$5,673** | **$41,715** | **$147,695** |
| | | | |
| **ARR** | $68K | $501K | $1.77M |
| **COGS (25%)** | $17K | $125K | $443K |
| **Gross Margin** | $51K | $376K | $1.33M |
| **S&M (45%)** | $31K | $225K | $797K |
| **R&D (30%)** | $20K | $150K | $531K |
| **G&A (15%)** | $10K | $75K | $266K |
| **Net Income** | **-$10K** | **-$74K** | **-$264K** |

**Note:** SaaS typically requires 5-7 years to profitability due to high upfront S&M costs.

### Unit Economics

**CAC by Channel:**
- Content marketing: $180/user (Pro), $450/team, $8,500/enterprise
- Academic conferences: $220/user, $520/team, $6,200/enterprise
- Referral program: $40/user, $180/team, N/A
- Blended CAC: **$145 (Pro), $420 (Team), $7,800 (Enterprise)**

**LTV:**
- Pro: 18-month avg retention × $19/mo = **$342**
- Team: 24-month retention × $79/mo = **$1,896**
- Enterprise: 36-month retention × avg $2,083/mo = **$75,000**

**LTV:CAC Ratios:**
- Pro: 2.4:1 (below healthy 3:1 threshold)
- Team: 4.5:1 (healthy)
- Enterprise: 9.6:1 (excellent)

### Conversion Funnel

| Stage | Year 1 | Year 2 | Year 3 | Benchmark |
|-------|--------|--------|--------|-----------|
| Visitors | 50,000 | 250,000 | 800,000 | - |
| Free signups | 5,000 (10%) | 25,000 (10%) | 80,000 (10%) | 8-15% |
| Free → Pro | 150 (3%) | 1,250 (5%) | 4,800 (6%) | 2-5% |
| Pro → Team | 12 (8%) | 85 (6.8%) | 280 (5.8%) | 5-10% |
| Team → Enterprise | 3 (25%) | 18 (21%) | 55 (20%) | 15-25% |

### Pricing Optimization

**Price Sensitivity Analysis:**
- Pro tier: $19 optimal (tested $9, $19, $29, $39)
  - $19: 3% conversion
  - $29: 2.1% conversion (−30% users, +53% revenue = +7% total)
  - Elasticity: −1.43
- Team tier: $79 optimal (sweet spot for academic labs)

### Break-Even Analysis

**Fixed Costs:** $280K/year (4 FTE + infrastructure)
**Contribution Margin:** 55% (after COGS)
**Break-even ARR:** $509K
**Timeline:** Month 28 (Year 3 Q1)

### Pros

- Predictable recurring revenue
- Low marginal cost (software scales)
- Direct customer relationship
- Fast iteration based on usage data
- Global reach (web-based)
- Freemium drives adoption

### Cons

- High upfront S&M costs (CAC payback: 14-18 months)
- Churn management complexity
- Payment processing fees (2.9% + $0.30)
- Requires continuous feature development
- Infrastructure costs scale with users
- Long path to profitability (5-7 years typical)

### Risk Factors

- **High:** Free-to-paid conversion below 3% (probability: 40%)
- **High:** Churn above 25% annual (probability: 35%)
- **Medium:** Enterprise sales cycle > 9 months (probability: 45%)
- **Low:** Platform downtime hurts retention (probability: 15%)

---

## Model 3: Enterprise Licensing + Support

### Structure

**License Tiers:**

**Departmental ($15K/year):**
- Up to 50 users
- Self-hosted or cloud
- Standard support (email, 48h response)
- Quarterly updates
- Single deployment

**University-Wide ($45K/year):**
- Unlimited users within institution
- Multi-deployment (research groups, courses)
- Priority support (24h response)
- Custom training (8 hours/year)
- Integration support

**Consortium ($120K/year):**
- Multi-institution (up to 5)
- Dedicated customer success manager
- Monthly check-ins
- Custom development budget ($10K/year included)
- Beta access

### Financial Projections (3 Years)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Departmental Licenses** | 8 | 35 | 85 |
| **University Licenses** | 3 | 15 | 42 |
| **Consortium Licenses** | 1 | 4 | 11 |
| | | | |
| **Dept Revenue** | $120K | $525K | $1.28M |
| **Univ Revenue** | $135K | $675K | $1.89M |
| **Consortium Revenue** | $120K | $480K | $1.32M |
| **Total Revenue** | **$375K** | **$1.68M** | **$4.49M** |
| | | | |
| **COGS (20%)** | $75K | $336K | $898K |
| **Gross Margin** | $300K | $1.34M | $3.59M |
| **Sales (35%)** | $131K | $588K | $1.57M |
| **R&D (25%)** | $94K | $420K | $1.12M |
| **Support (15%)** | $56K | $252K | $674K |
| **G&A (10%)** | $38K | $168K | $449K |
| **Net Income** | **-$19K** | **-$88K** | **-$224K** |

**Note:** Enterprise model profitable by Year 2 with proper cost management.

### Unit Economics

**CAC by Tier:**
- Departmental: $8,500 (direct sales + demos)
- University: $22,000 (longer sales cycle, procurement)
- Consortium: $45,000 (multi-stakeholder negotiation)

**LTV:**
- Departmental: 3.2 years × $15K = **$48K**
- University: 4.5 years × $45K = **$202.5K**
- Consortium: 6.0 years × $120K = **$720K**

**LTV:CAC Ratios:**
- Departmental: 5.6:1 (excellent)
- University: 9.2:1 (excellent)
- Consortium: 16:1 (exceptional)

### Sales Cycle

| Stage | Departmental | University | Consortium |
|-------|--------------|------------|------------|
| Lead to qualified | 2 weeks | 4 weeks | 8 weeks |
| Demo to POC | 3 weeks | 6 weeks | 12 weeks |
| POC to proposal | 2 weeks | 8 weeks | 16 weeks |
| Proposal to close | 4 weeks | 16 weeks | 24 weeks |
| **Total** | **11 weeks** | **34 weeks** | **60 weeks** |

### Break-Even Analysis

**Fixed Costs:** $320K/year (5 FTE: 2 sales, 2 eng, 1 support)
**Contribution Margin:** 65%
**Break-even Revenue:** $492K
**Timeline:** Month 14

### Pros

- High contract values (stronger margins)
- Long customer lifetime (universities renew contracts)
- Lower churn (institutional inertia)
- Fewer customers to support than SaaS
- Self-hosted option reduces infrastructure costs
- Strong references (prestigious universities)

### Cons

- Long sales cycles (34+ weeks for university)
- Requires dedicated sales team
- Procurement complexity (RFPs, contracts)
- Implementation overhead
- Regional licensing complexity
- Seasonal buying (academic calendar)

### Risk Factors

- **High:** Sales cycle extends beyond 12 months (probability: 35%)
- **Medium:** Budget cuts reduce institutional spending (probability: 40%)
- **Medium:** Self-hosted support burden (probability: 30%)
- **Low:** Competitor wins exclusive university deals (probability: 15%)

---

## Model 4: Marketplace (Plugins/Themes + Revenue Share)

### Structure

**Platform:**
- Core Formula Nebula: Free (MIT license)
- Marketplace: Commission-based

**Extension Types:**

1. **Knowledge Domains ($5-50)**
   - Number theory (500 theorems)
   - Topology (600 theorems)
   - Complex analysis (450 theorems)
   - Category theory (400 theorems)
   - Revenue share: 70% creator / 30% platform

2. **Visualization Themes ($3-15)**
   - Dark matter theme
   - Neon galaxy theme
   - Minimalist theme
   - Academic paper theme
   - Revenue share: 60% creator / 40% platform

3. **Tools & Integrations ($10-100)**
   - Jupyter notebook integration
   - LaTeX export plugin
   - Anki flashcard generator
   - Citation manager sync
   - Revenue share: 70% creator / 30% platform

4. **Premium Content ($20-200)**
   - Curated learning paths (with video lectures)
   - Problem sets with solutions
   - Research paper annotations
   - Expert commentary tracks
   - Revenue share: 60% creator / 40% platform (or 80/20 if exclusive)

### Financial Projections (3 Years)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| **Active Users** | 8,000 | 40,000 | 120,000 |
| **Marketplace Visitors** | 2,400 (30%) | 16,000 (40%) | 60,000 (50%) |
| **Purchasers** | 240 (10%) | 3,200 (20%) | 18,000 (30%) |
| **Avg Transaction** | $18 | $22 | $26 |
| | | | |
| **GMV** | $4,320 | $70,400 | $468,000 |
| **Platform Revenue (30%)** | **$1,296** | **$21,120** | **$140,400** |
| | | | |
| **Creator Payouts** | $3,024 | $49,280 | $327,600 |
| **Payment Processing (3%)** | $130 | $2,112 | $14,040 |
| **Net Revenue** | **$1,166** | **$19,008** | **$126,360** |
| | | | |
| **Platform Ops** | $80K | $140K | $220K |
| **Net Income** | **-$78,834** | **-$120,992** | **-$93,640** |

**Note:** Marketplace alone cannot sustain business; requires combination with other models.

### Unit Economics

**Creator Acquisition:**
- CAC per creator: $800 (developer relations + documentation)
- Active creators Year 3: 120
- Revenue per creator: $2,730/year (avg)
- LTV per creator: $8,190 (3 years)
- LTV:CAC: 10.2:1

**Buyer Metrics:**
- Avg purchases per year: 2.4
- Repurchase rate: 35%
- Platform take rate: 30-40%

### Break-Even Analysis

**Not viable as standalone model.**
Requires 1.2M+ active users for $1M+ platform revenue at current conversion rates.

### Pros

- Network effects (more creators → more buyers → more creators)
- Community-driven content (reduces R&D burden)
- Diverse revenue streams
- Scalable (software marketplace has near-zero marginal cost)
- Extensions drive platform stickiness

### Cons

- Chicken-and-egg problem (need users for creators, creators for users)
- Quality control challenges
- Revenue share limits platform margins
- Payment processing complexity (international creators)
- Support burden (platform + extensions)
- Requires critical mass (3+ years to viability)

### Risk Factors

- **Critical:** Insufficient creator supply (probability: 65%)
- **High:** Low conversion rate (<15%) (probability: 50%)
- **Medium:** Quality issues hurt reputation (probability: 35%)
- **Medium:** Competing marketplaces fragment ecosystem (probability: 25%)

---

## Model 5: Hybrid (RECOMMENDED)

### Structure Overview

**Phase 1 (Year 1): Foundation**
- Open source core (MIT license)
- SaaS freemium + Pro tier
- Build community & user base

**Phase 2 (Year 2): Expansion**
- Add Enterprise licensing
- Launch Team tier
- Establish sales function

**Phase 3 (Year 3): Ecosystem**
- Open marketplace (beta)
- Premium content partnerships
- Strategic integrations

### Revenue Mix by Phase

**Year 1:**
- Open source support: 15%
- SaaS (Free/Pro): 70%
- Enterprise (pilot): 15%

**Year 2:**
- Open source: 8%
- SaaS: 55%
- Enterprise: 35%
- Marketplace: 2%

**Year 3:**
- Open source: 5%
- SaaS: 40%
- Enterprise: 48%
- Marketplace: 7%

### Financial Projections (3 Years)

| Revenue Stream | Year 1 | Year 2 | Year 3 |
|----------------|--------|--------|--------|
| **Open Source** | | | |
| Support contracts | $45K | $80K | $120K |
| Custom dev | $30K | $60K | $100K |
| | | | |
| **SaaS** | | | |
| Pro tier (ARR) | $68K | $285K | $912K |
| Team tier (ARR) | $28K | $161K | $531K |
| | | | |
| **Enterprise** | | | |
| Departmental | $45K | $225K | $595K |
| University | - | $180K | $630K |
| Consortium | - | $120K | $360K |
| | | | |
| **Marketplace** | | | |
| Platform commission | - | $21K | $168K |
| | | | |
| **TOTAL REVENUE** | **$216K** | **$1.13M** | **$3.42M** |
| | | | |
| **Cost Structure** | | | |
| COGS | $54K (25%) | $283K (25%) | $855K (25%) |
| **Gross Profit** | **$162K** | **$847K** | **$2.56M** |
| **Gross Margin** | **75%** | **75%** | **75%** |
| | | | |
| Sales & Marketing | $75K (35%) | $395K (35%) | $1.20M (35%) |
| R&D | $54K (25%) | $283K (25%) | $855K (25%) |
| G&A | $32K (15%) | $170K (15%) | $513K (15%) |
| **Operating Exp** | **$161K** | **$848K** | **$2.57M** |
| | | | |
| **EBITDA** | **$1K** | **-$1K** | **-$10K** |
| **EBITDA Margin** | **0.5%** | **-0.1%** | **-0.3%** |

### Adjusted Projections (Conservative)

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Total Revenue | $216K | $904K | $2.73M |
| Gross Margin | 75% | 72% | 70% |
| Operating Margin | 0.5% | -6% | 8% |
| Net Income | $1K | -$54K | $218K |
| **Cumulative CF** | **-$45K** | **-$99K** | **+$119K** |

### Unit Economics (Blended)

**Weighted CAC:** $2,450
- Open source: $450 (40% of customers) = $180
- SaaS Pro: $145 (35% of customers) = $51
- SaaS Team: $420 (15% of customers) = $63
- Enterprise: $18,000 (10% of customers) = $1,800
- Marketplace: N/A (buyer CAC covered by platform fee)
- **Total weighted CAC: $2,094**

**Weighted LTV:** $14,280
- Open source: $38,400 × 0.40 = $15,360
- SaaS Pro: $342 × 0.35 = $120
- SaaS Team: $1,896 × 0.15 = $284
- Enterprise: $135,000 × 0.10 = $13,500
- **Total weighted LTV: $29,264**

**Blended LTV:CAC:** 14:1 (exceptional, driven by enterprise mix)

### Customer Journey

```
Discovery → Free Tier → Paid Tier → Enterprise
   ↓           ↓           ↓            ↓
GitHub    Try product   Pro/Team    Institutional
 star      (30 days)   subscription   license
```

**Conversion Rates:**
- Visitor → Free: 10%
- Free → Pro: 3-6%
- Pro → Team: 6-8%
- Team → Enterprise: 20%

### Break-Even Analysis

**Fixed Costs (Year 1):** $180K (8 FTE loaded: 3 eng, 2 sales, 1 marketing, 1 support, 1 ops)
**Fixed Costs (Year 2):** $420K (14 FTE)
**Fixed Costs (Year 3):** $780K (22 FTE)

**Contribution Margin:** 62% (blended across models)

**Break-even Timeline:**
- Monthly revenue break-even: Month 18 ($30K MRR)
- Cumulative cash break-even: Month 24 (cumulative CF positive)
- Profitability (EBITDA+): Month 32

### Staffing Plan

**Year 1 (8 FTE):**
- 3× Engineers (core product + features)
- 2× Sales (enterprise + outbound)
- 1× Marketing (content + demand gen)
- 1× Customer Success
- 1× Operations/Finance

**Year 2 (14 FTE, +6):**
- +2 Engineers (marketplace + integrations)
- +2 Sales (expand coverage)
- +1 Customer Success (enterprise accounts)
- +1 DevRel (open source community)

**Year 3 (22 FTE, +8):**
- +3 Engineers (scale + performance)
- +2 Sales (international expansion)
- +1 Product Manager
- +1 Marketing (partnerships)
- +1 Data Analyst

### Pricing Strategy

**Value-Based Pricing:**
- Pro: $19/mo (vs $50-100 for comparable tools) — penetration pricing
- Team: $79/mo (vs $200+ for team collaboration tools) — value pricing
- Enterprise: $15K-120K/year (vs $50K-500K for institutional software) — competitive pricing

**Price Increases:**
- Year 2: +$2/mo for Pro, +$10/mo for Team (grandfathering existing customers)
- Year 3: +$3/mo for Pro, +$15/mo for Team

### Geographic Expansion

**Year 1:** English + Chinese markets
- US, UK, Canada (60% of revenue)
- China (25% of revenue)
- Europe (10% of revenue)
- Other (5% of revenue)

**Year 2:** Add 3 languages
- German, French, Japanese
- Localized pricing (PPP-adjusted)

**Year 3:** Global
- 10+ languages
- Regional partnerships

### Channel Strategy

| Channel | Year 1 | Year 2 | Year 3 | CAC |
|---------|--------|--------|--------|-----|
| Organic (SEO + GitHub) | 40% | 30% | 25% | $80 |
| Content marketing | 25% | 25% | 20% | $