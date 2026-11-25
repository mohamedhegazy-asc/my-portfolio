import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

export default function TrafficChart({ data = [] }) {
  return (
    <div className="w-full h-64" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#222936',
              borderColor: '#374159',
              borderRadius: '10px',
              color: '#E0F6C4',
              fontSize: '12px'
            }}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#222936"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#B9D895', stroke: '#222936', strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: '#B9D895' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
