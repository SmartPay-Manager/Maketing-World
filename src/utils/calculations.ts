export const calculateCorrelation = (prices1: number[], prices2: number[]): number => {
  if (prices1.length !== prices2.length || prices1.length === 0) return 0;
  
  const n = prices1.length;
  const sum1 = prices1.reduce((a, b) => a + b, 0);
  const sum2 = prices2.reduce((a, b) => a + b, 0);
  const sum1Sq = prices1.reduce((a, b) => a + b * b, 0);
  const sum2Sq = prices2.reduce((a, b) => a + b * b, 0);
  const sumProducts = prices1.reduce((acc, val, i) => acc + val * prices2[i], 0);
  
  const numerator = n * sumProducts - sum1 * sum2;
  const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

/**
 * Calcule la volatilité d'une série de prix
 */
export const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  
  // Calculer les rendements logarithmiques
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  // Calculer la moyenne des rendements
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  
  // Calculer la variance
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  
  // Retourner l'écart-type (volatilité) en pourcentage
  return Math.sqrt(variance) * 100;
};

/**
 * Calcule le ratio de Sharpe simplifié
 */
export const calculateSharpeRatio = (returns: number[], riskFreeRate: number = 0.02): number => {
  if (returns.length === 0) return 0;
  
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev === 0 ? 0 : (meanReturn - riskFreeRate) / stdDev;
};

/**
 * Calcule le drawdown maximum
 */
export const calculateMaxDrawdown = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  let peak = values[0];
  let maxDrawdown = 0;
  
  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown * 100; // Retourner en pourcentage
};
