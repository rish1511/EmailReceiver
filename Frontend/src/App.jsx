import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, AlertCircle, CheckCircle2, Zap, Send } from 'lucide-react';

const API_BASE = import.meta.env.BACKEND_URL || 'http://localhost:5000/api';

export default function App() {
  const [metrics, setMetrics] = useState({ total: 0, regexSuccess: 0, aiSuccess: 0, flagged: 0 });
  const [cases, setCases] = useState([]);
  
  // Form State
  const [sender, setSender] = useState('RishTesting@company.com');
  const [subject, setSubject] = useState('Email Parser concept');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [metricsRes, casesRes] = await Promise.all([
        axios.get(`${API_BASE}/metrics`),
        axios.get(`${API_BASE}/cases`)
      ]);
      setMetrics(metricsRes.data);
      setCases(casesRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Auto refresh every 10 seconds for demo
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!emailBody.trim()) return alert("Email body cannot be empty");
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/ingest-email`, { sender, subject, emailBody });
      setEmailBody(''); // Clear form
      await fetchData(); // Refresh data immediately
      alert("Email sent to automation pipeline!");
    } catch (err) {
      console.error("Ingestion error:", err);
      alert("Error processing email. Check backend console.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
      
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Email Simulator Panel */}
          <div className="xl:col-span-1 bg-white p-7 rounded-2xl shadow-xl border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <Send className="text-blue-700" />
              <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">Live Webhook Simulator</h2>
            </div>
            
            <form onSubmit={handleIngest} className="space-y-5">
              <InputGroup label="Sender (From)" value={sender} setValue={setSender} type="email" />
              <InputGroup label="Subject" value={subject} setValue={setSubject} type="text" />
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Raw Email Body</label>
                <textarea 
                  rows="10" 
                  value={emailBody} 
                  onChange={e=>setEmailBody(e.target.value)} 
                  className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-mono text-sm"
                  placeholder="Hey, new matter came in. Customer is Ramesh Kumar from HDFC Bank..." 
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full text-white font-bold py-3.5 px-6 rounded-xl transition duration-200 shadow-md flex justify-center items-center gap-2 transform active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'}`}
              >
                {loading ? 'AI Pipeline Processing...' : 'Simulate Incoming Email'}
              </button>
            </form>
          </div>

          {/* Processing Queue Table */}
          <div className="xl:col-span-2 bg-white p-7 rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
             <div className="flex items-center gap-3 border-b pb-4 border-slate-100 mb-6">
              <LayoutDashboard className="text-blue-700" />
              <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">Live Processing Queue</h2>
            </div>

            <div className="overflow-y-auto h-[600px] pr-2">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
                  <tr>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Customer Name</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Case ID</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">NBFC</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Path</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map(c => (
                    <tr key={c._id} className={`${c.status === 'FLAGGED' ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'} transition`}>
                      <td className="p-4 font-medium text-slate-900 border-b border-slate-100">{c.name || <span className="text-slate-400 italic">not found</span>}</td>
                      <td className="p-4 font-bold border-b border-slate-100 font-mono tracking-wider">{c.caseId || '-'}</td>
                      <td className="p-4 text-slate-600 border-b border-slate-100">{c.nbfc || '-'}</td>
                      <td className="p-4 border-b border-slate-100">
                        <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${c.routingPath === 'REGEX' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'}`}>
                          {c.routingPath}
                        </span>
                      </td>
                      <td className="p-4 border-b border-slate-100">
                        {c.status === 'SUCCESS' 
                          ? <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit"><CheckCircle2 size={14}/> PASSED</span>
                          : <div className="text-xs font-bold text-red-800 bg-red-100 px-3 py-1.5 rounded-full flex flex-col gap-1 w-fit">
                              <span className="flex items-center gap-1.5"><AlertCircle size={14}/> FLAGGED</span>
                              {c.errorMessage && <span className="font-normal text-[10px] leading-tight text-red-700 bg-white/60 px-1.5 py-0.5 rounded italic">Error: {c.errorMessage}</span>}
                            </div>
                        }
                      </td>
                    </tr>
                  ))}
                  {cases.length === 0 && (
                    <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic">No cases processed through the pipeline yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <MetricCard title="Total Processed" value={metrics.total} color="border-slate-400" text="text-slate-700" icon={<LayoutDashboard size={32}/>} />
          <MetricCard title="Regex (Cost $0)" value={metrics.regexSuccess} color="border-sky-400" text="text-sky-600" icon={<Zap size={32}/>} description="Standard Path" />
          <MetricCard title="AI Free Path" value={metrics.aiSuccess} color="border-emerald-500" text="text-emerald-600" icon={<CheckCircle2 size={32}/>} description="OpenRouter Gemini/Llama" />
          <MetricCard title="Flagged for Review" value={metrics.flagged} color="border-red-500" text="text-red-600" icon={<AlertCircle size={32}/>} description="Validation Failed" />
        </div>
      </div>
    </div>
  );
}

// Helper: Metric Cards
function MetricCard({ title, value, color, text, icon, description }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-8 ${color} flex items-center justify-between border border-slate-100`}>
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1.5">{title}</h3>
        <p className={`text-4xl font-black ${text} leading-none mb-1`}>{value}</p>
        {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
      </div>
      <div className={`opacity-20 ${text} -mr-2`}>{icon}</div>
    </div>
  );
}

// Helper: Input Group
function InputGroup({ label, value, setValue, type }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e=>setValue(e.target.value)} 
        className="w-full p-3.5 border-2 border-slate-200 rounded-xl bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
        required 
      />
    </div>
  );
}