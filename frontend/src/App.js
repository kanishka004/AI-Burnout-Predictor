import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormPage from "./pages/FormPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<FormPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </Router>
  );
}

export default App;