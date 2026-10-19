import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ReactElement, PropsWithChildren } from "react";
import { WagmiProvider, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { monadTestnet, monadMainnet } from "../util/monad";
import "@rainbow-me/rainbowkit/styles.css";

const projectId =
  (import.meta as { env?: Record<string, string> }).env
    ?.VITE_WALLET_CONNECT_PROJECT_ID || "3fbb64395228a8e53e21a6eedd0cf4e2";

const wagmiConfig = getDefaultConfig({
  appName: "Chuglife",
  projectId,
  chains: [monadTestnet, monadMainnet, mainnet, sepolia],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
    [monadMainnet.id]: http("https://rpc.monad.xyz"),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});

const queryClient = new QueryClient();

export default function WalletContext({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#836ef9",
            accentColorForeground: "#ffffff",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

