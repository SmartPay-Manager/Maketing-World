import { format, formatDistanceToNow } from 'date-fns';

/**
 * Formate une valeur monétaire en USD
 */
export const formatCurrency = (
  value: number | string, 
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    compact?: boolean;
  } = {}
): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0.00';

  const { 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2,
    compact = false 
  } = options;

  if (compact && numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(1)}M`;
  }
  
  if (compact && numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numValue);
};

/**
 * Formate un pourcentage avec signe et couleur
 */
export const formatPercentage = (
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
    colorClass?: boolean;
  } = {}
): string => {
  const { decimals = 2, showSign = true, colorClass = false } = options;
  
  if (isNaN(value)) return '0.00%';

  const sign = showSign && value > 0 ? '+' : '';
  const formatted = `${sign}${value.toFixed(decimals)}%`;
  
  if (colorClass) {
    return value >= 0 ? `text-green-400 ${formatted}` : `text-red-400 ${formatted}`;
  }
  
  return formatted;
};

/**
 * Formate une adresse crypto (début...fin)
 */
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length < startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formate une valeur de token avec le bon nombre de décimales
 */
export const formatTokenAmount = (
  amount: string | number,
  decimals: number = 18,
  displayDecimals: number = 6
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '0';

  // Si c'est un très petit nombre, utiliser la notation scientifique
  if (numAmount < 0.000001 && numAmount > 0) {
    return numAmount.toExponential(2);
  }

  // Pour les gros nombres, utiliser la notation compacte
  if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(2)}M`;
  }
  
  if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(2)}K`;
  }

  return numAmount.toFixed(displayDecimals);
};

/**
 * Formate un timestamp en temps relatif ("2 minutes ago")
 */
export const formatTimeAgo = (timestamp: number): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
};

/**
 * Formate un timestamp en date/heure lisible
 */
export const formatDateTime = (timestamp: number, includeTime: boolean = true): string => {
  try {
    const formatString = includeTime ? 'MMM dd, yyyy HH:mm:ss' : 'MMM dd, yyyy';
    return format(new Date(timestamp), formatString);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Formate le temps restant en minutes:secondes
 */
export const formatTimeRemaining = (futureTimestamp: number): string => {
  const now = Date.now();
  const remaining = futureTimestamp - now;
  
  if (remaining <= 0) return 'Expired';
  
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Formate une valeur de gas en Gwei
 */
export const formatGasPrice = (gasPrice: string | number): string => {
  const gasPriceNum = typeof gasPrice === 'string' ? parseFloat(gasPrice) : gasPrice;
  
  // Convertir de wei en gwei (diviser par 1e9)
  const gwei = gasPriceNum / 1e9;
  
  return `${gwei.toFixed(1)} Gwei`;
};

/**
 * Formate une hash de transaction (début...fin)
 */
export const formatTxHash = (hash: string): string => {
  return formatAddress(hash, 8, 6);
};

/**
 * Détermine la couleur basée sur le changement de prix
 */
export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-slate-400';
};

/**
 * Formate une grande valeur numérique de manière lisible
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

/**
 * Calcule et formate le prix d'impact
 */
export const formatPriceImpact = (impact: number): { formatted: string; severity: 'low' | 'medium' | 'high' } => {
  const impactPercent = Math.abs(impact);
  
  let severity: 'low' | 'medium' | 'high';
  if (impactPercent < 0.1) severity = 'low';
  else if (impactPercent < 1) severity = 'medium';
  else severity = 'high';
  
  return {
    formatted: `${impactPercent.toFixed(2)}%`,
    severity
  };
};

/**
 * Formate le statut d'un trade avec couleur
 */
export const formatTradeStatus = (status: string): { text: string; colorClass: string } => {
  const statusMap = {
    pending: { text: 'Pending', colorClass: 'text-amber-400 bg-amber-900/20' },
    processing: { text: 'Processing', colorClass: 'text-blue-400 bg-blue-900/20' },
    completed: { text: 'Completed', colorClass: 'text-green-400 bg-green-900/20' },
    failed: { text: 'Failed', colorClass: 'text-red-400 bg-red-900/20' },
    expired: { text: 'Expired', colorClass: 'text-gray-400 bg-gray-900/20' },
    cancelled: { text: 'Cancelled', colorClass: 'text-orange-400 bg-orange-900/20' }
  };
  
  return statusMap[status as keyof typeof statusMap] || { 
    text: status, 
    colorClass: 'text-slate-400 bg-slate-900/20' 
  };
};
