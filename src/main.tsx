import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PondProvider } from "./pond/react";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PondProvider>
      <App />
    </PondProvider>
  </StrictMode>,
);
