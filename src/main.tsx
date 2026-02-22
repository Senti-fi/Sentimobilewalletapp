import "./lib/posthog";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider, Environment } from "@getpara/react-sdk-lite";
import "@getpara/react-sdk-lite/styles.css";
import { PARA_API_KEY } from "./lib/para";
import App from "./app/App.tsx";
import "./styles/index.css";

const queryClient = new QueryClient();

// Hide Para SDK warning banners (BETA env + WalletConnect warnings)
// These are styled-components rendered in the Para modal with #fffcec background
const observer = new MutationObserver(() => {
  document.querySelectorAll('div').forEach((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg === 'rgb(255, 252, 236)' && el.textContent?.includes('Para')) {
      el.style.display = 'none';
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ParaProvider
      paraClientConfig={{
        env: Environment.BETA,
        apiKey: PARA_API_KEY,
      }}
      config={{
        appName: "Senti",
      }}
      externalWalletConfig={{
        wallets: [],
      }}
      paraModalConfig={{
        oAuthMethods: ["GOOGLE", "APPLE"],
        disablePhoneLogin: true,
        authLayout: ["AUTH:FULL"],
        recoverySecretStepEnabled: true,
        onRampTestMode: true,
      }}
    >
      <App />
    </ParaProvider>
  </QueryClientProvider>
);
