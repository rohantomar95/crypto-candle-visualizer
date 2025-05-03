
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RoundIndicator from './RoundIndicator';
import { generateCandleData } from './candleUtils';

interface Candle {
  id: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
  currentPrice?: number;
  animationComplete?: boolean;
}

const CandleChart: React.FC = () => {
  const [currentRound, setCurrentRound] = useState(1);
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [visibleCandles, setVisibleCandles] = useState(24);
  const [animatingCandle, setAnimatingCandle] = useState<number | null>(null);
  const [showTradePlaced, setShowTradePlaced] = useState(false);
  const animationRef = useRef<number | null>(null);
  
  // Generate data for different rounds
  useEffect(() => {
    // Different starting prices for each round
    const startingPrices = {
      1: 3500, // ETH price
      2: 95000, // BTC price
      3: 6.5,  // SOL price
      4: 600,  // BNB price
      5: 1.2,  // XRP price
    };
    
    const cryptoNames = {
      1: "ETH/USD",
      2: "BTC/USD",
      3: "SOL/USD",
      4: "BNB/USD",
      5: "XRP/USD",
    };
    
    // Clear animations when changing rounds
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Reset state for new round
    setShowTradePlaced(false);
    setVisibleCandles(24);
    setAnimatingCandle(null);
    
    // Generate new data for this round
    const data = generateCandleData(50, startingPrices[currentRound as keyof typeof startingPrices]);
    setCandleData(data);
    
    // Start animating the final candle after a delay
    setTimeout(() => {
      setAnimatingCandle(23);
    }, 1000);
    
  }, [currentRound]);

  useEffect(() => {
    if (animatingCandle !== null && candleData.length > 0) {
      const candle = candleData[animatingCandle];
      const isGreen = candle.close > candle.open;
      const startTime = performance.now();
      const animationDuration = 2000; // 2 seconds
      
      // Set initial animation state
      setCandleData(prev => {
        const updated = [...prev];
        updated[animatingCandle] = {
          ...updated[animatingCandle],
          currentPrice: updated[animatingCandle].open,
          animationComplete: false
        };
        return updated;
      });
      
      // Animation function
      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        // Update the current price based on animation progress
        setCandleData(prev => {
          const updated = [...prev];
          const target = updated[animatingCandle];
          
          if (isGreen) {
            // For green candles, animate from open to close (up)
            target.currentPrice = target.open + (target.close - target.open) * progress;
          } else {
            // For red candles, animate from open to close (down)
            target.currentPrice = target.open + (target.close - target.open) * progress;
          }
          
          // Mark animation as complete when done
          if (progress === 1) {
            target.animationComplete = true;
            
            // Show "Trade Placed" annotation after candle completes
            setTimeout(() => {
              setShowTradePlaced(true);
            }, 500);
            
            // Start showing remaining candles after a delay
            setTimeout(() => {
              let currentVisible = 24;
              const interval = setInterval(() => {
                if (currentVisible < candleData.length) {
                  currentVisible++;
                  setVisibleCandles(currentVisible);
                } else {
                  clearInterval(interval);
                }
              }, 800);
            }, 1500);
          }
          
          return updated;
        });
        
        // Continue animation until complete
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Start animation
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [animatingCandle, candleData]);

  const calculatePriceRange = () => {
    const prices = candleData.slice(0, visibleCandles).flatMap(d => [d.high, d.low]);
    if (prices.length === 0) return { max: 100, min: 0 };
    
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const padding = (maxPrice - minPrice) * 0.1;
    return {
      max: maxPrice + padding,
      min: minPrice - padding
    };
  };
  
  const calculateVolumeMax = () => {
    const volumes = candleData.slice(0, visibleCandles).map(d => d.volume);
    return volumes.length > 0 ? Math.max(...volumes) : 10000;
  };
  
  const priceRange = candleData.length > 0 ? calculatePriceRange() : { max: 100, min: 0 };
  const volumeMax = candleData.length > 0 ? calculateVolumeMax() : 10000;
  
  const priceToY = (price: number) => {
    const chartHeight = 500;
    return chartHeight - ((price - priceRange.min) / (priceRange.max - priceRange.min)) * chartHeight;
  };
  
  const volumeToHeight = (volume: number) => {
    const volumeBarHeight = 120;
    return (volume / volumeMax) * volumeBarHeight;
  };
  
  const renderCandle = (candle: Candle, index: number) => {
    const isGreen = candle.close > candle.open;
    const isAnimating = index === animatingCandle;
    
    // For animating candles, use the currentPrice
    const currentHigh = isAnimating ? 
      Math.max(candle.open, candle.currentPrice || candle.open) : 
      candle.high;
    
    const currentLow = isAnimating ? 
      Math.min(candle.open, candle.currentPrice || candle.open) : 
      candle.low;
    
    const currentClose = isAnimating ? 
      candle.currentPrice || candle.open : 
      candle.close;
    
    // Calculate positions
    const wickTop = priceToY(isAnimating ? currentHigh : candle.high);
    const wickBottom = priceToY(isAnimating ? currentLow : candle.low);
    const candleTop = priceToY(Math.max(candle.open, currentClose));
    const candleBottom = priceToY(Math.min(candle.open, currentClose));
    const candleHeight = Math.max(2, candleBottom - candleTop);
    
    const x = 40 + index * 25;
    const isNewCandle = index >= 24 && !isAnimating;
    
    return (
      <g 
        key={candle.id}
        className={`candle ${isNewCandle ? 'animate-fadeIn' : ''}`}
        style={{
          animationDelay: isNewCandle ? `${(index - 24) * 0.8}s` : '0s'
        }}
      >
        {/* Wick */}
        <line
          x1={x}
          y1={wickTop}
          x2={x}
          y2={wickBottom}
          stroke={isGreen ? '#26a69a' : '#ef5350'}
          strokeWidth="1"
        />
        
        {/* Candle body */}
        <rect
          x={x - 8}
          y={candleTop}
          width="16"
          height={candleHeight}
          fill={isGreen ? '#26a69a' : '#ef5350'}
          stroke="none"
        />
        
        {/* Trade Placed marker */}
        {showTradePlaced && index === 23 && (
          <g className="animate-bounce-in">
            <line
              x1={x}
              y1={priceToY(candle.close) - 30}
              x2={x}
              y2={priceToY(candle.close) - 10}
              stroke="#4fd1c5"
              strokeWidth="2"
            />
            <circle
              cx={x}
              cy={priceToY(candle.close) - 35}
              r="8"
              fill="#4fd1c5"
            />
            <text
              x={x}
              y={priceToY(candle.close) - 60}
              textAnchor="middle"
              fill="#4fd1c5"
              fontSize="12"
              fontWeight="bold"
              className="trade-marker"
            >
              Trade Placed
            </text>
            <text
              x={x}
              y={priceToY(candle.close) - 45}
              textAnchor="middle"
              fill="#4fd1c5"
              fontSize="12"
              className="trade-marker"
            >
              at {candle.close.toFixed(2)}
            </text>
          </g>
        )}
      </g>
    );
  };
  
  const renderVolumeBar = (candle: Candle, index: number) => {
    const x = 40 + index * 25;
    const height = volumeToHeight(candle.volume);
    const isGreen = candle.close > candle.open;
    const isNewVolume = index >= 24;
    
    return (
      <rect
        key={`vol-${candle.id}`}
        x={x - 8}
        y={540 - height}
        width="16"
        height={height}
        fill={isGreen ? '#26a69a40' : '#ef535040'}
        stroke="none"
        className={isNewVolume ? 'animate-fadeIn' : ''}
        style={{
          animationDelay: isNewVolume ? `${(index - 24) * 0.8}s` : '0s'
        }}
      />
    );
  };
  
  const generateYAxisLabels = () => {
    const labels = [];
    const step = (priceRange.max - priceRange.min) / 8;
    for (let i = 0; i <= 8; i++) {
      const price = priceRange.min + step * i;
      const y = priceToY(price);
      labels.push({ price, y });
    }
    return labels;
  };
  
  // Handle navigation between rounds
  const navigateRound = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentRound > 1) {
      setCurrentRound(currentRound - 1);
    } else if (direction === 'next' && currentRound < 5) {
      setCurrentRound(currentRound + 1);
    }
  };

  // Get cryptocurrency name based on current round
  const getCryptoName = () => {
    switch(currentRound) {
      case 1: return "ETH/USD";
      case 2: return "BTC/USD";
      case 3: return "SOL/USD";
      case 4: return "BNB/USD";
      case 5: return "XRP/USD";
      default: return "ETH/USD";
    }
  };

  return (
    <div className="p-6 bg-[#141721] rounded-xl shadow-xl border border-gray-800">
      {/* Chart header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-1 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 mr-4"></div>
          <h2 className="text-3xl font-bold text-white">{getCryptoName()} Price Chart</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          <div>
            <h3 className="text-gray-400 mb-2 text-center">Championship Progress</h3>
            <div className="flex items-center justify-center space-x-2">
              <RoundIndicator totalRounds={5} currentRound={currentRound} />
              <div className="bg-[#1a1f2c] rounded-full px-4 py-1 text-cyan-400 font-bold">
                {currentRound}/5
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="bg-[#1a1f2c] p-2 rounded-full text-gray-400 hover:text-white disabled:opacity-50"
              onClick={() => navigateRound('prev')}
              disabled={currentRound === 1}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="bg-cyan-400 w-12 h-12 rounded-full flex items-center justify-center text-[#1a1f2c] font-bold text-xl">
              {currentRound}
            </div>
            <button 
              className="bg-[#1a1f2c] p-2 rounded-full text-gray-400 hover:text-white disabled:opacity-50"
              onClick={() => navigateRound('next')}
              disabled={currentRound === 5}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chart visualization */}
      <div className="relative">
        <svg width="100%" height="660" className="overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#26a69a20" />
              <stop offset="100%" stopColor="#26a69a00" />
            </linearGradient>
            <pattern id="grid" width="25" height="50" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 50" fill="none" stroke="#232838" strokeWidth="0.5"/>
            </pattern>
          </defs>
          
          {/* Grid */}
          <rect width="100%" height="500" fill="url(#grid)" />
          
          {/* Y-axis (Price) */}
          {generateYAxisLabels().map(({ price, y }, i) => (
            <g key={i}>
              <line x1="40" y1={y} x2="100%" y2={y} stroke="#232838" strokeWidth="0.5" />
              <text x="0" y={y} dy="4" textAnchor="start" fill="#888" fontSize="12">
                ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </text>
            </g>
          ))}
          
          {/* Volume Y-axis */}
          <line x1="40" y1="540" x2="100%" y2="540" stroke="#232838" strokeWidth="0.5" />
          
          {/* Candles */}
          {candleData.slice(0, visibleCandles).map((candle, i) => renderCandle(candle, i))}
          
          {/* Volume bars */}
          {candleData.slice(0, visibleCandles).map((candle, i) => renderVolumeBar(candle, i))}
          
          {/* X-axis labels */}
          {candleData.slice(0, visibleCandles).map((candle, i) => {
            if (i % 4 === 0) { // Show every 4th timestamp
              const x = 40 + i * 25;
              return (
                <text 
                  key={`time-${i}`}
                  x={x} 
                  y="580" 
                  textAnchor="middle" 
                  fill="#888" 
                  fontSize="11"
                  className={i >= 24 ? 'animate-fadeIn' : ''}
                  style={{
                    animationDelay: i >= 24 ? `${(i - 24) * 0.8}s` : '0s'
                  }}
                >
                  {candle.timestamp}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <div>Volume: {volumeMax.toLocaleString()}</div>
        {visibleCandles < candleData.length && (
          <div>Loading {candleData.length - visibleCandles} more candles...</div>
        )}
      </div>
    </div>
  );
};

export default CandleChart;
