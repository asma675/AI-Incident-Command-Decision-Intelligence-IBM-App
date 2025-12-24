import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerformanceChart({ incidents }) {
  // Generate hourly data for the last 24 hours
  const hourlyData = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(now);
    hourStart.setHours(now.getHours() - i, 0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourStart.getHours() + 1);
    
    const hourIncidents = incidents.filter(inc => {
      const date = new Date(inc.created_date);
      return date >= hourStart && date < hourEnd;
    });
    
    hourlyData.push({
      time: hourStart.getHours() === now.getHours() ? "Now" : `${hourStart.getHours()}:00`,
      incidents: hourIncidents.length,
      critical: hourIncidents.filter(i => i.severity === "critical").length,
      high: hourIncidents.filter(i => i.severity === "high").length,
      resolved: hourIncidents.filter(i => i.status === "resolved" || i.status === "closed").length
    });
  }
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{entry.name}:</span>
              <span className="font-semibold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Last 24 Hours Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8" 
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="incidents" 
                name="Total Incidents"
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="critical" 
                name="Critical"
                stroke="#f43f5e" 
                strokeWidth={2}
                dot={{ fill: "#f43f5e", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                name="High Priority"
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="resolved" 
                name="Resolved"
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}