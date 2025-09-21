import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

import "./global.css";

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
