import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { Toaster } from "@/components/ui/toast";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SidebarProvider>
            <App />
            <Toaster />
        </SidebarProvider>
    </StrictMode>,
);
