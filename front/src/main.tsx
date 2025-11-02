import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import mixpanel from "mixpanel-browser";

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
  autocapture: false,
  record_sessions_percent: 0,
});

createRoot(document.getElementById("root")!).render(<App />);
