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
    <div className="rounded-xl border border-[#333333] bg-[#28323D] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#078DEE] flex items-center justify-center text-white">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-[#FFFFFF] font-semibold">Account Activity</h3>
            <p className="text-xs text-[#919EAB]">Online vs Total accounts over time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#078DEE] rounded-full" />
            <span className="text-xs text-[#919EAB]">Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-[#637381] rounded-full" />
            <span className="text-xs text-[#919EAB]">Total</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" opacity={0.5} />
          <XAxis dataKey="time" stroke="#919EAB" style={{ fontSize: '12px' }} />
          <YAxis stroke="#919EAB" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#28323D', border: '1px solid #333333', borderRadius: '8px' }}
            labelStyle={{ color: '#FFFFFF' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#078DEE" 
            dot={false}
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
