import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';

interface MetaMaskQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

const MetaMaskQRModal: React.FC<MetaMaskQRModalProps> = ({ isOpen, onClose, walletAddress }) => {
  if (!isOpen) return null;

  // If no wallet is connected, show a message
  if (!walletAddress) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <img
              src="/metamask-fox.svg"
              alt="MetaMask"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h2 className="text-xl font-bold text-slate-200 mb-2">
              Wallet Not Connected
            </h2>
            <p className="text-slate-400 mb-4">
              Please connect your MetaMask wallet first to generate a QR code.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <img
            src="/metamask-fox.svg"
            alt="MetaMask"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-slate-200 mb-2">
            Connect with MetaMask
          </h2>
          <p className="text-slate-400 mb-6">
            Scan this QR code with your phone's camera to connect your MetaMask mobile wallet
          </p>

          <div className="bg-white p-4 rounded-lg inline-block mb-6">
            <QRCodeSVG
              value={walletAddress}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-300 mb-1">Wallet Address</p>
            <p className="text-xs text-slate-400 break-all bg-slate-700/50 p-2 rounded">
              {walletAddress}
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Share this QR code to receive funds or connect with other DeFi apps
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskQRModal;
