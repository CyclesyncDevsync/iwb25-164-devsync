# Demand Prediction API Documentation

## Overview
The Demand Prediction API provides AI-powered forecasting for waste material demand, pricing predictions, and market insights to help users make informed business decisions.

## Base URL
```
http://localhost:8081/api/ai/demand
```

## Endpoints

### 1. Generate Demand Forecast
Predicts future demand for specific waste types and locations.

**Endpoint:** `POST /forecast`  
**Full URL:** `http://localhost:8081/api/ai/demand/forecast`

**Request Body:**
```json
{
    "wasteType": "plastic",      // Type of waste: plastic, organic, paper, metal, electronics
    "location": "colombo",       // City/region name
    "timeHorizon": "week"        // Forecast period: week, month, or quarter
}
```

**Response:**
```json
{
    "wasteType": "plastic",
    "location": "colombo",
    "predictionId": "983465be-5dc9-48a9-977c-fe7aed97b756",
    "generatedAt": [1754867135, 0.235363000],
    "nextWeekDemand": 106.57,
    "nextMonthDemand": 463.07,
    "nextQuarterDemand": 1393.08,
    "confidenceLevel": 0.369,
    "demandLowerBound": 69.11,
    "demandUpperBound": 144.03,
    "predictedPricePerTon": 788.41,
    "priceVolatility": 0.1,
    "keyDrivers": [
        "Strong economic conditions increasing waste generation",
        "Plastic pollution awareness increasing recycling demand"
    ],
    "marketTrend": "stable",
    "opportunityScore": 89.83
}
```

**Response Fields Explained:**

| Field | Type | Description | Example Value | What It Means for Your Dashboard |
|-------|------|-------------|---------------|----------------------------------|
| `nextWeekDemand` | float | Total predicted waste (tons) for next 7 days | 106.57 | Display as "Weekly Forecast: 107 tons" |
| `nextMonthDemand` | float | Total predicted waste (tons) for next 30 days | 463.07 | Display as "Monthly Forecast: 463 tons" |
| `nextQuarterDemand` | float | Total predicted waste (tons) for next 90 days | 1393.08 | Display as "Quarterly Forecast: 1,393 tons" |
| `confidenceLevel` | float | Model's confidence (0-1) | 0.369 | Show as percentage: "37% confidence" with color coding (red < 50%, yellow 50-75%, green > 75%) |
| `demandLowerBound` | float | Minimum expected weekly demand (tons) | 69.11 | Display range: "69-144 tons/week expected" |
| `demandUpperBound` | float | Maximum expected weekly demand (tons) | 144.03 | Part of the range display |
| `predictedPricePerTon` | float | Expected market price ($/ton) | 788.41 | Display as "Market Price: $788/ton" |
| `priceVolatility` | float | Price stability (0-1) | 0.1 | Show as "Price Volatility: Low (10%)" |
| `keyDrivers` | string[] | Market factors affecting demand | ["Strong economic...", "Plastic pollution..."] | Display as bullet points under "Market Drivers" |
| `marketTrend` | string | Demand direction | "stable" | Show with icon: ➡️ stable, ⬆️ increasing, ⬇️ decreasing |
| `opportunityScore` | float | Business opportunity rating (0-100) | 89.83 | Display as gauge/progress bar with label "Business Opportunity: Excellent (90/100)" |

### 2. Get Bidding Recommendations
Provides strategic bidding advice based on demand predictions.

**Endpoint:** `POST /bidding-recommendations`  
**Full URL:** `http://localhost:8081/api/ai/demand/bidding-recommendations`

**Request Body:**
```json
{
    "wasteStreamId": "WS-12345",
    "wasteType": "plastic",
    "location": "colombo",
    "quantity": 25.5
}
```

**Response:**
```json
{
    "recommendationId": "uuid",
    "wasteStreamId": "WS-12345",
    "generatedAt": [timestamp],
    "suggestedStartingBid": 850.50,
    "reservePrice": 680.40,
    "maximumBid": 1105.65,
    "optimalBiddingTime": [timestamp],
    "biddingUrgency": "immediate",
    "competitionLevel": 0.75,
    "competitorInsights": [
        "Expected 8 other bidders",
        "Market trending up - expect higher bids"
    ],
    "winProbability": 0.65,
    "profitabilityScore": 78.5
}
```

### 3. Get Historical Data
Retrieves historical demand data used for predictions.

**Endpoint:** `GET /history/{wasteType}/{location}`  
**Full URL:** `http://localhost:8081/api/ai/demand/history/plastic/colombo`

**Response:**
```json
{
    "wasteType": "plastic",
    "location": "colombo",
    "historicalData": [
        {
            "date": [timestamp],
            "quantity": 15.5,
            "price": 750.00,
            "qualityScore": 85.0,
            "sourceIndustry": "manufacturing",
            "weatherCondition": "sunny",
            "economicIndicator": "growth"
        }
        // ... 365 days of data
    ],
    "demandTrend": [15.5, 16.2, 14.8, ...],
    "averageDemand": 15.8,
    "peakDemand": 25.5,
    "lowDemand": 8.2,
    "volatilityIndex": 0.35,
    "seasonalityFactor": 0.65
}
```

### 4. Batch Predictions
Get predictions for multiple waste types and locations at once.

**Endpoint:** `POST /batch-forecast`  
**Full URL:** `http://localhost:8081/api/ai/demand/batch-forecast`

**Request Body:**
```json
{
    "wasteTypes": ["plastic", "organic", "paper"],
    "locations": ["colombo", "kandy"],
    "timeHorizon": "week"
}
```

## Implementation Guide for Frontend Developers

### 1. Dashboard Cards to Display

```javascript
// Demand Forecast Card
const DemandForecastCard = ({ data }) => {
  return (
    <Card>
      <h3>Demand Forecast - {data.wasteType}</h3>
      <div className="metrics">
        <Metric label="Next Week" value={`${Math.round(data.nextWeekDemand)} tons`} />
        <Metric label="Next Month" value={`${Math.round(data.nextMonthDemand)} tons`} />
        <Metric label="Confidence" value={`${Math.round(data.confidenceLevel * 100)}%`} 
                color={getConfidenceColor(data.confidenceLevel)} />
      </div>
    </Card>
  );
};

// Market Insights Card
const MarketInsightsCard = ({ data }) => {
  return (
    <Card>
      <h3>Market Analysis</h3>
      <div className="opportunity-score">
        <CircularProgress value={data.opportunityScore} max={100} />
        <span>{getOpportunityLabel(data.opportunityScore)}</span>
      </div>
      <div className="trend">
        Market Trend: {getTrendIcon(data.marketTrend)} {data.marketTrend}
      </div>
      <div className="price">
        Expected Price: ${data.predictedPricePerTon.toFixed(2)}/ton
      </div>
    </Card>
  );
};
```

### 2. Helper Functions

```javascript
// Interpret confidence levels
function getConfidenceColor(confidence) {
  if (confidence < 0.5) return 'red';
  if (confidence < 0.75) return 'yellow';
  return 'green';
}

// Interpret opportunity scores
function getOpportunityLabel(score) {
  if (score >= 80) return 'Excellent Opportunity';
  if (score >= 60) return 'Good Opportunity';
  if (score >= 40) return 'Fair Opportunity';
  return 'Poor Opportunity';
}

// Market trend icons
function getTrendIcon(trend) {
  switch(trend) {
    case 'increasing': return '📈';
    case 'decreasing': return '📉';
    default: return '➡️';
  }
}
```

### 3. API Integration Example

```javascript
// Fetch demand forecast
async function getDemandForecast(wasteType, location, timeHorizon = 'week') {
  try {
    const response = await fetch('http://localhost:8081/api/ai/demand/forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wasteType,
        location,
        timeHorizon
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching demand forecast:', error);
    throw error;
  }
}

// Usage in React component
useEffect(() => {
  getDemandForecast('plastic', 'colombo', 'week')
    .then(data => {
      setForecastData(data);
      // Update dashboard with new data
    });
}, []);
```

### 4. Visual Components to Consider

1. **Demand Gauge**: Show weekly/monthly demand as a gauge chart
2. **Confidence Meter**: Display confidence level with color coding
3. **Price Chart**: Show predicted price with volatility indicator
4. **Opportunity Score**: Circular progress or star rating
5. **Market Drivers**: List with icons for each driver
6. **Trend Arrow**: Visual indicator for market direction
7. **Range Chart**: Show demand bounds (lower to upper)

### 5. Error Handling

```javascript
// Handle API errors gracefully
if (response.status === 400) {
  // Invalid request - show form validation errors
}
if (response.status === 500) {
  // Server error - show retry option
}
```

### 6. Refresh Strategy

- Auto-refresh predictions every hour
- Allow manual refresh with a button
- Cache results for 15 minutes to reduce API calls
- Show "last updated" timestamp

## Best Practices

1. **Loading States**: Show skeleton loaders while fetching data
2. **Error States**: Display meaningful error messages
3. **Empty States**: Handle cases where no data is available
4. **Responsive Design**: Ensure cards work on mobile devices
5. **Accessibility**: Use proper ARIA labels for screen readers
6. **Performance**: Implement pagination for historical data

## Sample Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│                  Demand Prediction                   │
├─────────────────┬─────────────────┬─────────────────┤
│  Weekly Demand  │ Monthly Demand  │   Confidence    │
│    107 tons     │    463 tons     │      37%        │
├─────────────────┴─────────────────┴─────────────────┤
│                Market Opportunity                    │
│              [████████████░] 90%                    │
│                  Excellent                          │
├─────────────────────────────────────────────────────┤
│ Price Forecast: $788/ton    Volatility: Low (10%)  │
├─────────────────────────────────────────────────────┤
│ Market Drivers:                                     │
│ • Strong economic conditions                        │
│ • Plastic pollution awareness                       │
└─────────────────────────────────────────────────────┘
```