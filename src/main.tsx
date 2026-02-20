import "./lib/posthog";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { PARA_API_KEY } from "./lib/para";
import App from "./app/App.tsx";
import "./styles/index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ParaProvider
      paraClientConfig={{
        apiKey: PARA_API_KEY,
      }}
      config={{
        appName: "Senti Wallet",
      }}
    >
      <App />
    </ParaProvider>
  </QueryClientProvider>
);
