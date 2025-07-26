import React from "react";
import ReactDOM from "react-dom/client";
import AppWithRouter from "./App.jsx"; // ✅ must use AppWithRouter not App

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWithRouter />
  </React.StrictMode>
);
