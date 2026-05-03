import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrend } from "../api";
import { Line } from "react-chartjs-2";
import "../styles/Dashboard.css";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
} from "chart.js";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement
);

export default function DashboardPage() {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [trend, setTrend] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        const stored = JSON.parse(localStorage.getItem("result"));
        setResult(stored);

        getTrend().then((res) => setTrend(res.data));
    }, [navigate]);

    if (!result) return <p>Loading...</p>;

    return (
        <div className="dashboard-page">
            <div className="dashboard">
                <h1>Burnout Dashboard</h1>

                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                >
                    Logout
                </button>

                <div className="cards">
                    <div className="card">
                        <h2>{result.burnout_score}</h2>
                        <p>Burnout Score</p>
                    </div>

                    <div className={`card ${result.burnout_risk.toLowerCase()}`}>
                        <h2>{result.burnout_risk}</h2>
                        <p>Risk Level</p>
                    </div>
                </div>

                {result.warning && <div className="warning">{result.warning}</div>}

                <div className="card">
                    <h3>Reasons</h3>
                    <ul>
                        {result.reasons.length > 0
                            ? result.reasons.map((r, i) => <li key={i}>{r}</li>)
                            : <li>AI detected pattern-based risk</li>}
                    </ul>
                </div>

                <div className="card">
                    <h3>Recommendations</h3>
                    <ul>
                        {result.recommendations.length > 0
                            ? result.recommendations.map((r, i) => <li key={i}>{r}</li>)
                            : result.burnout_risk === "Low"
                                ? <li>Maintain your current healthy work habits and continue monitoring</li>
                                : result.burnout_risk === "Medium"
                                    ? <li>Consider taking short breaks during work and review your workload</li>
                                    : <li>Consider taking regular breaks and practicing mindfulness techniques</li>}
                    </ul>
                </div>

                {trend && (
                    <div className="card">
                        <Line
                            data={{
                                labels: trend.dates,
                                datasets: [
                                    {
                                        label: "Burnout Score",
                                        data: trend.burnout_scores,
                                        borderWidth: 3,
                                        tension: 0.4
                                    }
                                ]
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}