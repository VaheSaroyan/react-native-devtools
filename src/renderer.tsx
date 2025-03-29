import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import "./index.css";

// Initialize React
const container = document.getElementById("app");
if (!container) {
  throw new Error("Failed to find the root element");
}
const root = createRoot(container);
root.render(<App />);

console.log("👋 React renderer is running!");
