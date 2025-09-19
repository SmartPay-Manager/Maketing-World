import React, { useState } from 'react';
import { ChevronDown, Bell, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MetaMaskQRModal from './MetaMaskQRModal';

interface NavbarProps {
  walletAddress?: string;
  onConnectWallet: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ walletAddress, onConnectWallet }) => {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnect = () => {
    if (typeof window.ethereum !== 'undefined') {
      onConnectWallet();
    } else {
      setIsQRModalOpen(true);
    }
  };

  return (
    <nav className="border-b border-deep-purple-500/30" style={{ backgroundColor: 'rgba(59, 22, 84, 0.5)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-green-400 text-xl font-bold"></h1>
            </div>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="text-slate-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/community" className="text-slate-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium">
                Community
              </Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <button className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50">
              <User className="w-5 h-5" />
            </button>

            {/* Wallet Connection */}
            {walletAddress ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsQRModalOpen(true)}
                    className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50"
                  >
                    <img 
                      src="/metamask-fox.svg" 
                      alt="Show QR" 
                      className="w-4 h-4"
                    />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm font-medium">{formatAddress(walletAddress)}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <img 
                    src="/metamask-fox.svg" 
                    alt="MetaMask" 
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Connect with MetaMask</span>
                </button>
              </motion.div>
            )}
            
            {/* MetaMask QR Modal */}
            <MetaMaskQRModal 
              isOpen={isQRModalOpen} 
              onClose={() => setIsQRModalOpen(false)}
              walletAddress={walletAddress}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
