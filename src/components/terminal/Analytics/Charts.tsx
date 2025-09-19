import React, { useState } from 'react';
import type { ChartData } from '../../../types/api';

interface ChartIndicator {
  type: string;
  settings: Record<string, any>;
  visible: boolean;
}

interface DrawingTool {
  type: string;
  color: string;
  width: number;
}

interface ChartsProps {
  data?: ChartData[];
  isLoading?: boolean;
  type?: 'portfolio' | 'token' | 'trading';
  walletAddress?: string;
  timeframes?: string[];
  showTools?: boolean;
  indicators?: string[];
  drawingTools?: string[];
}

const Charts: React.FC<ChartsProps> = ({ 
  data = [], 
  isLoading = false, 
  type = 'token',
  walletAddress,
  timeframes = ['1D'],
  showTools = false,
  indicators = [],
  drawingTools = []
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[0]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <p className="text-slate-400">No chart data available</p>
      </div>
    );
  }

  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  const getChartTitle = () => {
    switch (type) {
      case 'portfolio':
        return 'Portfolio Performance';
      case 'trading':
        return 'BTC/USDT';
      default:
        return 'Price Chart';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl">
      {/* Chart Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-200">
              {getChartTitle()}
            </h3>
            {type === 'trading' && (
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl font-semibold">$43,567.89</span>
                <span className="text-green-400 text-sm">+2.45%</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {showTools && (
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-1">
                <button
                  onClick={() => setShowToolbar(!showToolbar)}
                  className="px-3 py-1.5 rounded text-sm text-slate-300 hover:bg-slate-600/50"
                >
                  Indicators
                </button>
                <button
                  onClick={() => setShowToolbar(!showToolbar)}
                  className="px-3 py-1.5 rounded text-sm text-slate-300 hover:bg-slate-600/50"
                >
                  Tools
                </button>
              </div>
            )}
            <div className="flex gap-1 bg-slate-700/30 rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1.5 rounded text-sm ${
                    selectedTimeframe === timeframe
                      ? 'bg-green-500 text-white'
                      : 'text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Panel */}
        {showToolbar && (
          <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-700/30 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Indicators</h4>
              <div className="grid grid-cols-3 gap-2">
                {indicators?.map((indicator) => (
                  <button
                    key={indicator}
                    onClick={() => setSelectedIndicators(prev => 
                      prev.includes(indicator) 
                        ? prev.filter(i => i !== indicator)
                        : [...prev, indicator]
                    )}
                    className={`px-3 py-1.5 rounded text-sm ${
                      selectedIndicators.includes(indicator)
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50'
                    }`}
                  >
                    {indicator}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Drawing Tools</h4>
              <div className="grid grid-cols-3 gap-2">
                {drawingTools?.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool === selectedTool ? null : tool)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      selectedTool === tool
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50'
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="h-[600px] p-4">
        <div className="w-full h-full rounded-lg bg-slate-800/30 border border-slate-700/30 flex items-center justify-center">
          <p className="text-slate-400">Advanced chart visualization coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Charts;
