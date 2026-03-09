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
    <div className="rounded-xl border border-white/5 bg-[#161b22] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-white font-semibold">Account Activity</h3>
            <p className="text-xs text-gray-400">Online vs Total accounts over time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
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
