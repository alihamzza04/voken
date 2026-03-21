import * as React from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import {
  Dashboard,
  Proposals,
  ProposalDetail,
  CreateProposal,
  BuyTokens,
  Admin,
  Profile,
} from "./pages";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const endpoint = "http://127.0.0.1:8899";

  const wallets = React.useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/proposals/:id" element={<ProposalDetail />} />
                  <Route path="/create" element={<CreateProposal />} />
                  <Route path="/buy-tokens" element={<BuyTokens />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Layout>
            </BrowserRouter>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgba(18, 18, 26, 0.95)",
                  color: "#fff",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "16px",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: {
                    primary: "#14F195",
                    secondary: "#0a0a0f",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ff4757",
                    secondary: "#0a0a0f",
                  },
                },
              }}
            />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}

export default App;
