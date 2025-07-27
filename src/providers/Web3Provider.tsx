import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { mainnet, polygon, polygonMumbai, hardhat } from 'wagmi/chains';

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: process.env.REACT_APP_ALCHEMY_ID,
    walletConnectProjectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID!,

    // Required
    appName: "Virtual Building Empire",
    appDescription: "NFT Character Collection Game with LUNC Rewards",
    appUrl: "https://virtualbuilding.game",
    appIcon: "https://virtualbuilding.game/icon.png",

    chains: [
      ...(process.env.NODE_ENV === 'development' ? [hardhat] : []),
      mainnet,
      polygon,
      polygonMumbai,
    ],
    transports: {
      [mainnet.id]: http(`https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_ID}`),
      [polygon.id]: http(`https://polygon-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_ID}`),
      [polygonMumbai.id]: http(`https://polygon-mumbai.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_ID}`),
      ...(process.env.NODE_ENV === 'development' && {
        [hardhat.id]: http('http://127.0.0.1:8545'),
      }),
    },
  })
);

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="auto"
          options={{
            initialChainId: process.env.NODE_ENV === 'development' ? hardhat.id : polygon.id,
            enforceSupportedChains: true,
            disclaimer: (
              <div style={{ padding: '20px', fontSize: '14px' }}>
                <p>
                  🎮 <strong>Virtual Building Empire</strong> - Connect your wallet to start 
                  collecting NFT characters and earning LUNC tokens!
                </p>
                <p style={{ opacity: 0.8, marginTop: '10px' }}>
                  Keine Investment-Beratung. LUNC Rewards sind Gameplay-Belohnungen. 
                  Spiele verantwortungsvoll.
                </p>
              </div>
            ),
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};