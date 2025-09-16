import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { pwa } from "@/utils/pwa";

// Initialize PWA functionality
pwa.initialize().then(() => {
  console.log('PWA initialized successfully');
  // Cache essential data for offline use
  pwa.cacheEssentialData();
  // Track PWA usage
  pwa.trackPWAUsage();
});

createRoot(document.getElementById("root")!).render(<App />);
