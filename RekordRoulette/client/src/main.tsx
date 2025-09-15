import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { pwa } from "@/utils/pwa";

// Temporarily disable PWA functionality to fix production issues
// TODO: Re-enable after fixing ServiceWorker CSP issues
console.log('PWA disabled temporarily for production stability');

createRoot(document.getElementById("root")!).render(<App />);
