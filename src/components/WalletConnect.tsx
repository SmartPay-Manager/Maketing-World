import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { SwapForm } from './terminal/SwapForm';

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showSwapModal, setShowSwapModal] = useState(false);

  const handleQuickSwap = () => {
    if (!isConnected) {
      connect({ connector: connectors[0] });
    } else {
      setShowSwapModal(true);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleQuickSwap}
        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">
          {isConnected ? 'Quick Swap' : 'Connect to Swap'}
        </span>
      </motion.button>

      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Quick Swap</h2>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <SwapForm walletAddress={address} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
