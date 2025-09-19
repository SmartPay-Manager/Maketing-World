import React from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
  onClose: () => void;
}

const SignalAlert: React.FC<Props> = ({ message, type, show, onClose }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-50 text-green-800 border-green-400',
    error: 'bg-red-50 text-red-800 border-red-400',
    info: 'bg-blue-50 text-blue-800 border-blue-400'
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColor} shadow-lg flex items-center space-x-3`}
    >
      <span role="img" aria-label={type}>
        {icon}
      </span>
      <p>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="ml-4 text-gray-500 hover:text-gray-700"
        aria-label="Close alert"
      >
        ×
      </button>
    </motion.div>
  );
};

export default SignalAlert;
