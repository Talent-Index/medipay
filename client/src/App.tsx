import '@mysten/dapp-kit/dist/index.css';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Router } from "./Routes";
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { SuiWalletProvider } from "./contexts/SuiWalletContext";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};


const App = () => {
  // Ensure the auth store rehydrates on app mount, then mark hydrated
  useEffect(() => {
    const rehydrate = async () => {
      try {
        await (useAuthStore as any).persist?.rehydrate?.();
      } finally {
        useAuthStore.setState({ hydrated: true });
      }
    };
    rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <WalletProvider>
          <SuiWalletProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Router />
              </BrowserRouter>
            </TooltipProvider>
          </SuiWalletProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default App;
