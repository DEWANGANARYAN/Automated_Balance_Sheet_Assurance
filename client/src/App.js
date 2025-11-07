import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { sessionCheck } from "./services/AuthService";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import ReportDetail from "./components/ReportDetail";
import Header from "./components/Header";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await sessionCheck();
      setLoggedIn(res.data.logged_in);
    }
    check();
  }, []);

  return (
    <Router>
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path="/" element={loggedIn ? <Navigate to="/dashboard" /> : <SignIn setLoggedIn={setLoggedIn} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={loggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/report/:id" element={loggedIn ? <ReportDetail /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
