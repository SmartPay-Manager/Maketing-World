import React from 'react';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  name: string;
  logo: string;
  score: number;
  chain: 'ETH' | 'XRP';
  signal: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  logo,
  score,
  chain,
  signal
}) => {
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder-logo.png';
  };

  const isEligible = score >= 70;
  const isChainSupported = chain === 'ETH';

  const handleSwap = () => {
    window.open(`https://app.1inch.io/#/1/unified/swap/${chain}`, '_blank');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt={`${name} logo`}
            className="w-12 h-12 rounded-full object-contain bg-gray-50"
            onError={handleImgError}
          />
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          score >= 80 ? 'bg-green-100 text-green-800' :
          score >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          Score: {score}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        <span role="img" aria-label="Signal">📊</span> {signal}
      </p>

      {isEligible ? (
        isChainSupported ? (
          <button
            onClick={handleSwap}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
            aria-label={`Swap ${name} via 1inch`}
          >
            Swap via 1inch
          </button>
        ) : (
          <p className="text-center text-sm text-red-500">
            Swap not available on {chain}
          </p>
        )
      ) : (
        <p className="text-center text-sm text-gray-500">
          Project not eligible for swap
        </p>
      )}
    </motion.div>
  );
};

export default ProjectCard;
