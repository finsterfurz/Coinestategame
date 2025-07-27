import React from 'react';
import { ConnectKitButton } from 'connectkit';
import { useAccount, useBalance, useNetwork, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from 'react-hot-toast';

interface ModernWalletProps {
  onConnectionChange?: (connected: boolean, address?: string) => void;
}

export const ModernWallet: React.FC<ModernWalletProps> = ({ onConnectionChange }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  
  // Get ETH balance
  const { data: balance } = useBalance({
    address: address,
    watch: true,
  });

  // Handle connection changes
  React.useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected, address);
    }
  }, [isConnected, address, onConnectionChange]);

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    toast.success('Wallet disconnected');
  };

  return (
    <div className="modern-wallet">
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, address, truncatedAddress, ensName }) => {
          if (isConnected && address) {
            return (
              <div className="wallet-connected">
                <div className="wallet-info">
                  <div className="wallet-address">
                    <span className="wallet-status">🟢</span>
                    <span className="address-text">
                      {ensName || truncatedAddress}
                    </span>
                  </div>
                  
                  <div className="wallet-details">
                    <div className="balance">
                      <span className="balance-label">ETH:</span>
                      <span className="balance-value">
                        {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.0000'}
                      </span>
                    </div>
                    
                    <div className="network">
                      <span className="network-label">Network:</span>
                      <span className="network-value">
                        {chain?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="wallet-actions">
                  <button 
                    className="wallet-button secondary"
                    onClick={show}
                    title="Wallet Details"
                  >
                    👤
                  </button>
                  
                  <button 
                    className="wallet-button danger"
                    onClick={handleDisconnect}
                    title="Disconnect"
                  >
                    🚪
                  </button>
                </div>
              </div>
            );
          }

          return (
            <button
              onClick={show}
              className={`wallet-button connect ${isConnecting ? 'connecting' : ''}`}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <span>
                  <span className="spinner">⏳</span>
                  Connecting...
                </span>
              ) : (
                <span>
                  🔗 Connect Wallet
                </span>
              )}
            </button>
          );
        }}
      </ConnectKitButton.Custom>
      
      {/* Network warning */}
      {isConnected && chain && chain.id !== 137 && chain.id !== 80001 && (
        <div className="network-warning">
          ⚠️ Please switch to Polygon network for optimal experience
        </div>
      )}
    </div>
  );
};

// CSS styles (add to your CSS file)
export const walletStyles = `
.modern-wallet {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.wallet-connected {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wallet-address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
}

.wallet-status {
  font-size: 8px;
}

.address-text {
  font-family: 'Courier New', monospace;
}

.wallet-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  opacity: 0.8;
}

.balance, .network {
  display: flex;
  gap: 4px;
}

.balance-label, .network-label {
  font-weight: 500;
}

.balance-value {
  font-family: 'Courier New', monospace;
}

.wallet-actions {
  display: flex;
  gap: 6px;
}

.wallet-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.wallet-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wallet-button:active {
  transform: translateY(0);
}

.wallet-button.connect {
  padding: 12px 24px;
  font-size: 16px;
}

.wallet-button.secondary {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  padding: 6px 10px;
  font-size: 12px;
}

.wallet-button.danger {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  padding: 6px 10px;
  font-size: 12px;
}

.wallet-button.connecting {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.network-warning {
  background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  max-width: 200px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Mobile responsive */
@media (max-width: 768px) {
  .wallet-connected {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .wallet-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .wallet-actions {
    align-self: flex-end;
  }
  
  .address-text {
    font-size: 12px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .wallet-connected {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
`;

export default ModernWallet;