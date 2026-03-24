
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { FeatureProvider } from "./context/FeatureContext";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <FeatureProvider>
        <App />
      </FeatureProvider>
    </AuthProvider>
  </BrowserRouter>
);
