import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/fira-sans/400.css";
import "@fontsource/fira-sans/600.css";
import "@fontsource/jetbrains-mono/500.css";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
