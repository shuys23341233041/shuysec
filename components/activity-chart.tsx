'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

const data = [
  { time: '14:00', value: 0 },
  { time: '15:00', value: 0 },
  { time: '16:00', value: 0 },
  { time: '17:00', value: 0 },
  { time: '18:00', value: 2800 },
  { time: '19:00', value: 3200 },
  { time: '20:00', value: 3500 },
  { time: '21:00', value: 3400 },
  { time: '22:00', value: 3450 },
  { time: '23:00', value: 3420 },
  { time: '00:00', value: 3400 },
  { time: '01:00', value: 3380 },
  { time: '02:00', value: 3370 },
]

export function ActivityChart() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/60 group cursor-default">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-all duration-300 group-hover:scale-110">
            <TrendingUp size={18} className="text-white transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <div>
            <h3 className="text-white font-semibold transition-colors duration-300 group-hover:text-cyan-300">Account Activity</h3>
            <p className="text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300">Online vs Total accounts over time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Online</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e5e7eb' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#0ea5e9" 
            dot={false}
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
