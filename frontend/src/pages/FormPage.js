import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { predictBurnout } from "../api";
import "../styles/FormPage.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function FormPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("TOKEN:", token);
        if (!token) {
            navigate("/login");
        }
    }, []);

    const [form, setForm] = useState({
        work_hours: "",
        sleep_hours: "",
        breaks_count: "",
        task_load: "",
        stress_level: "",
        screen_time: "",
        commits_count: "",
        tasks_completed: "",
        focus_hours: "",
        interruptions: "",
        meeting_hours: ""
    });

    const [loading, setLoading] = useState(false);

    const placeholders = {
        work_hours: "8",
        sleep_hours: "7",
        breaks_count: "2",
        task_load: "1",
        stress_level: "5",
        screen_time: "8",
        commits_count: "3",
        tasks_completed: "5",
        focus_hours: "4",
        interruptions: "3",
        meeting_hours: "1"
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const numericForm = {};
            for (const key in form) {
                numericForm[key] = Number(form[key]);
            }

            const res = await axios.post(
                "https://ai-burnout-predictor-backend.onrender.com/predict",
                numericForm,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            localStorage.setItem("result", JSON.stringify(res.data));

            toast.success("Prediction generated!");

            navigate("/dashboard");

        } catch (err) {
            if (err.response?.status === 401) {
                toast.error("Session expired. Please login again");
                navigate("/login");
            } else if (err.response?.status === 422) {
                toast.error("Invalid input data. Check values.");
            } else {
                toast.error("Prediction failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-container">
                <h2>AI-Based Preventive Productivity & Mental Health Intelligence System</h2>
                <p>Enter your daily activity data</p>

                <div className="form-grid">
                    {Object.keys(form).map((key) => (
                        <div key={key} className="input-group">
                            <label>{key.replace("_", " ").toUpperCase()}</label>
                            <input
                                type="number"
                                name={key}
                                value={form[key]}
                                placeholder={placeholders[key]}
                                onChange={handleChange}
                            />
                        </div>
                    ))}
                </div>

                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Predicting..." : "Predict Burnout"}
                </button>
            </div>
        </div>
    );
}