import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function SignupPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      await axios.post("https://ai-burnout-predictor-backend.onrender.com/signup", {
        email: user.email.trim().toLowerCase(),
        password: user.password.trim()
      });

      toast.success("Signup successful! Please login");

      navigate("/login");

    } catch (err) {
      toast.error("User already exists or error occurred");
    }
  };

  return (
    <div className="auth-container">
      <h1>Create Account</h1>

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <button onClick={handleSignup}>Sign Up</button>

      <p onClick={() => navigate("/login")}>
        Already have an account? Login
      </p>
    </div>
  );
}