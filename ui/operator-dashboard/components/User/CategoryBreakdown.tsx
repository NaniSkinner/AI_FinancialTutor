"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/Common";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryBreakdownProps {
  data?: Array<{
    name: string;
    value: number;
  }>;
}

// Generate mock data for demo
const generateMockData = () => [
  { name: "Food & Dining", value: 450 },
  { name: "Shopping", value: 320 },
  { name: "Transportation", value: 180 },
  { name: "Entertainment", value: 150 },
  { name: "Bills & Utilities", value: 280 },
  { name: "Other", value: 120 },
];

const COLORS = [
  "rgb(99, 102, 241)",   // Indigo
  "rgb(59, 130, 246)",   // Blue
  "rgb(16, 185, 129)",   // Green
  "rgb(251, 146, 60)",   // Orange
  "rgb(139, 92, 246)",   // Purple
  "rgb(156, 163, 175)",  // Gray
];

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const chartData = useMemo(() => data || generateMockData(), [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].name}
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
            ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {payload[0].percent}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                animationBegin={200}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

