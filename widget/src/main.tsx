import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const body = document.getElementsByTagName("body")[0];
const root = document.createElement("div");
body.prepend(root);
ReactDOM.createRoot(root!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
