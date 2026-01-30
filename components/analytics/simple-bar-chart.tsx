'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'

export function SimpleBarChart({
    data,
    dataKey,
    valueKey,
    color
}: {
    data: any[],
    dataKey: string,
    valueKey: string,
    color?: string
}) {
    if (!data?.length) return <div className="flex h-[300px] items-center justify-center text-zinc-500">No data</div>

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey={dataKey} stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        cursor={{fill: '#27272a'}}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '6px' }}
                        itemStyle={{ color: '#e4e4e7' }}
                    />
                    <Bar dataKey={valueKey} fill={color || "#8884d8"} radius={[4, 4, 0, 0]}>
                        {!color && data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry[valueKey] < 0 ? '#ef4444' : '#10b981'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
