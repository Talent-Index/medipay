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

const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networks} defaultNetwork="devnet">
      <WalletProvider>
        <SuiWalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Router />
            </BrowserRouter>
          </TooltipProvider>
        </SuiWalletProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

export default App;
