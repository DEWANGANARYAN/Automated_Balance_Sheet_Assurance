"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { VarianceAnalysis } from '@/lib/types';

interface VarianceAnalysisChartProps {
  variances: VarianceAnalysis[];
}

const COLORS = {
  positive: 'hsl(var(--chart-1))',
  negative: 'hsl(var(--chart-2))',
  anomaly: 'hsl(var(--destructive))',
};

export default function VarianceAnalysisChart({ variances }: VarianceAnalysisChartProps) {
  // Prepare data for variance bar chart
  const varianceData = variances.slice(0, 10).map(v => ({
    account: v.accountNumber || `Account ${v.glAccountId}`,
    variance: v.variancePercentage,
    amount: v.varianceAmount,
    anomaly: v.anomalyDetected,
  }));

  // Prepare data for period comparison
  const periodData = [
    {
      period: 'MoM',
      count: variances.filter(v => v.periodComparison === 'MoM').length,
    },
    {
      period: 'QoQ',
      count: variances.filter(v => v.periodComparison === 'QoQ').length,
    },
    {
      period: 'YoY',
      count: variances.filter(v => v.periodComparison === 'YoY').length,
    },
  ];

  // Calculate anomaly statistics
  const anomalyCount = variances.filter(v => v.anomalyDetected).length;
  const totalVariances = variances.length;
  const anomalyPercentage = totalVariances > 0 ? (anomalyCount / totalVariances * 100).toFixed(1) : '0';

  // Prepare anomaly pie chart data
  const anomalyData = [
    { name: 'Normal', value: totalVariances - anomalyCount, color: COLORS.positive },
    { name: 'Anomalies', value: anomalyCount, color: COLORS.anomaly },
  ];

  const chartConfig = {
    variance: {
      label: 'Variance %',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Variance Bar Chart */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Top 10 Variances</h3>
            <p className="text-sm text-muted-foreground">
              Percentage variance by GL account
            </p>
          </div>
          
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={varianceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="account" 
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="variance" 
                  fill="var(--color-variance)"
                  radius={[4, 4, 0, 0]}
                >
                  {varianceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.anomaly ? COLORS.anomaly : 
                            entry.variance > 0 ? COLORS.positive : COLORS.negative}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      {/* Anomaly Detection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Anomaly Detection</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered variance anomaly analysis
            </p>
          </div>

          <div className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={anomalyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {anomalyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{anomalyCount}</p>
              <p className="text-sm text-muted-foreground">Anomalies Detected</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{anomalyPercentage}%</p>
              <p className="text-sm text-muted-foreground">Anomaly Rate</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Period Comparison */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Period Comparison</h3>
            <p className="text-sm text-muted-foreground">
              Variance analysis by time period
            </p>
          </div>

          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="period" type="category" className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill={COLORS.positive} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>

      {/* Anomaly List */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Critical Anomalies</h3>
            <p className="text-sm text-muted-foreground">
              Variances requiring immediate attention
            </p>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {variances
              .filter(v => v.anomalyDetected)
              .slice(0, 5)
              .map((variance) => (
                <div key={variance.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {variance.accountNumber || `Account ${variance.glAccountId}`}
                      </span>
                      <Badge variant={variance.variancePercentage > 0 ? "default" : "secondary"}>
                        {variance.variancePercentage > 0 ? '+' : ''}
                        {variance.variancePercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {variance.anomalyReason || 'Significant variance detected'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {variance.varianceAmount > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs font-medium">
                        ${Math.abs(variance.varianceAmount).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {variance.periodComparison}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            
            {variances.filter(v => v.anomalyDetected).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No anomalies detected</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
