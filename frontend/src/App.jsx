import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Activity, Users, Clock, MousePointer, Info } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24'];

function App() {
  const [metrics, setMetrics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashRes, chartsRes, predRes] = await Promise.all([
        axios.get(`${API_BASE}/analytics/dashboard`),
        axios.get(`${API_BASE}/analytics/charts`),
        axios.get(`${API_BASE}/prediction/peak-traffic`)
      ]);

      setMetrics(dashRes.data);
      setCharts(chartsRes.data);
      setPrediction(predRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return <div className="loading">Loading Analytics...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Antigravity Analytics</h1>
          <p>Real-time insights & predictive metrics</p>
        </div>
        <button onClick={fetchData}>Refresh Data</button>
      </header>

      {/* Hero Stats */}
      <section className="stats-grid">
        <StatCard
          icon={<Users size={20} />}
          label="Active Visitors (5m)"
          value={metrics?.active_visitors || 0}
          trend="+12%"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Total Pageviews"
          value={metrics?.total_pageviews || 0}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Avg. Session"
          value={`${metrics?.avg_session_duration || 0}s`}
        />
        <StatCard
          icon={<MousePointer size={20} />}
          label="Bounce Rate"
          value={`${metrics?.bounce_rate || 0}%`}
          desc="Users leaving > 1 page"
        />
      </section>

      {/* Main Charts */}
      <section className="charts-grid">
        <div className="card">
          <h2>Top Pages</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.top_pages || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Traffic Distribution</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.traffic_sources || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.traffic_sources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {charts?.traffic_sources?.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ width: 8, height: 8, background: COLORS[index % COLORS.length], borderRadius: '50%', marginRight: 6 }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insights & Devices */}
      <section className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h2>Device Usage</h2>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.devices || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2><Info size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} /> AI Insights</h2>
          <div style={{ marginTop: '1rem' }}>
            <div className="stat-label">Predicted Peak Traffic</div>
            <div className="stat-value" style={{ fontSize: '1.5rem', color: '#34d399' }}>
              {prediction?.peak_time_str || "N/A"}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <div className="stat-label">Recommendations</div>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', color: '#cbd5e1' }}>
                {prediction?.recommendations && prediction.recommendations.length > 0 ? (
                  prediction.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))
                ) : (
                  <li>Traffic looks normal. Keep optimizing content!</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, trend, desc }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stat-label">{label}</div>
        <div style={{ color: 'var(--accent)', opacity: 0.8 }}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      {desc && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div>}
      {trend && <div style={{ fontSize: '0.8rem', color: '#34d399' }}>{trend}</div>}
    </div>
  );
}

export default App;
