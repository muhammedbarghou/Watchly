import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import Login from "./pages/Login";

function App() {
  // Simple auth check - you should implement proper authentication

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/chat"
          element={<ChatPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;