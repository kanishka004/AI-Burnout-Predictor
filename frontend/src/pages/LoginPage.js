import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/login", {
        email: user.email.trim().toLowerCase(),
        password: user.password.trim()
      });

      localStorage.setItem("token", res.data.token);

      toast.success("Login successful!");

      navigate("/"); 

    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Server error. Try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>

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

      <button onClick={handleLogin}>Login</button>

      <p onClick={() => navigate("/signup")}>
        Don't have an account? Signup
      </p>
    </div>
  );
}