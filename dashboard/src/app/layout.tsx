import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import {  sepolia } from 'viem/chains';

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import AppWrappers from "./AppWrappers";
import { ReactNode } from "react";

const config = createConfig({
  chains: [sepolia ],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
  },
});
  
const queryClient = new QueryClient();
  
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
    <body id={'root'}>
      <AppWrappers>
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "8d1a0fcf-94bc-4ca7-bbe0-0d36017f8084",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
          {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider> 
    </DynamicContextProvider>
    </AppWrappers>
      </body>
    </html>
  );
};