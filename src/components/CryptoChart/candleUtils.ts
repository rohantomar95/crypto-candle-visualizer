
export const generateCandleData = (count: number, startingPrice: number = 3500) => {
  const data = [];
  let price = startingPrice;
  
  for (let i = 0; i < count; i++) {
    // Adjust volatility based on the cryptocurrency
    const volatility = startingPrice > 50000 ? 0.01 : startingPrice > 1000 ? 0.02 : 0.03;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const change = price * volatility * Math.random() * direction;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(1000 + Math.random() * 5000);
    
    data.push({
      id: i,
      open,
      high,
      low,
      close,
      volume,
      timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
    
    price = close;
  }
  
  return data;
};

// Generate more realistic trading patterns
export const generatePatternedCandleData = (
  count: number, 
  startingPrice: number = 3500,
  pattern: 'uptrend' | 'downtrend' | 'sideways' | 'volatile' = 'sideways'
) => {
  const data = [];
  let price = startingPrice;
  
  // Pattern-specific configuration
  const patternConfig = {
    uptrend: { upProbability: 0.7, volatilityMultiplier: 1 },
    downtrend: { upProbability: 0.3, volatilityMultiplier: 1 },
    sideways: { upProbability: 0.5, volatilityMultiplier: 0.7 },
    volatile: { upProbability: 0.5, volatilityMultiplier: 2 },
  };
  
  const config = patternConfig[pattern];
  
  for (let i = 0; i < count; i++) {
    // Base volatility based on the cryptocurrency price range
    let baseVolatility = startingPrice > 50000 ? 0.01 : 
                         startingPrice > 1000 ? 0.02 : 0.03;
    
    // Apply pattern-specific volatility modifier
    const volatility = baseVolatility * config.volatilityMultiplier;
    
    // Direction based on pattern probability
    const direction = Math.random() > config.upProbability ? -1 : 1;
    const change = price * volatility * Math.random() * direction;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(1000 + Math.random() * 5000);
    
    data.push({
      id: i,
      open,
      high,
      low,
      close,
      volume,
      timestamp: new Date(Date.now() - (count - i) * 60000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
    
    price = close;
  }
  
  return data;
};
