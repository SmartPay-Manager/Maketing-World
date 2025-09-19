import React from 'react';
import { motion } from 'framer-motion';
import { SwapForm } from './SwapForm';

interface SwapInterfaceProps {
  walletAddress?: string;
  className?: string;
}

const SwapInterface: React.FC<SwapInterfaceProps> = ({ 
  walletAddress, 
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${className}`}
    >
      <SwapForm walletAddress={walletAddress} />
    </motion.div>
  );
};

export default SwapInterface;