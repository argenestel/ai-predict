'use client';
// Layout components
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import routes from 'routes';
import {
  getActiveNavbar,
  getActiveRoute,
  isWindowAvailable,
} from 'utils/navigation';
import React from 'react';
import { Portal } from '@chakra-ui/portal';
import Navbar from 'components/navbar';
import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';
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
import { sepolia, morphHolesky } from 'viem/chains';

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const config = createConfig({
  chains: [sepolia, morphHolesky],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
    [morphHolesky.id]: http()
  },
});

const queryClient = new QueryClient();


export default function Admin({ children }: { children: React.ReactNode }) {
  // states and functions
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  return (
    <div className="flex h-full w-full bg-background-100 dark:bg-background-900">
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
              {/* <Sidebar routes={routes} open={open} setOpen={setOpen} variant="admin" /> */}
              <div className="h-full w-full font-dm dark:bg-navy-900">
                <main
                  className={`mx-2.5  flex-none transition-all dark:bg-navy-900 
              md:pr-2`}
                >
                  <div>
                    <Navbar isMobile={undefined}                    />
                    <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
                      {children}
                    </div>
                    <div className="p-3">
                      <Footer />
                    </div>
                  </div>
                </main>
              </div>
            </DynamicWagmiConnector>
          </QueryClientProvider>
        </WagmiProvider>
      </DynamicContextProvider>

    </div>
  );
}
