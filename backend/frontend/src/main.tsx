import { createRoot } from "react-dom/client";
import "./lib/fetch-shim";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <App />
);
