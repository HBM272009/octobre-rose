import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Header from "./App.jsx";


createRoot(document.getElementById("header")).render(
    <StrictMode>
        <Header />
    </StrictMode>,
);
