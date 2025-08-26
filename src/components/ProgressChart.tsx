import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { ChartLine, TrendingUp, Calendar, Clock } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface ProgressChartProps {
  className?: string
}

export default function ProgressChart({ className = '' }: ProgressChartProps) {
  const { analyticsData } = useAnalytics()

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-primary animate-pulse" />
            Gráfico de Progresso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform weekly progress data for charts
  const chartData = analyticsData.weeklyProgress.map((week, index) => ({
    week: `Sem ${index + 1}`,
    studyTime: Math.round(week.studyTime / 60), // Convert to hours
    lessons: week.lessonsCompleted,
    score: week.averageScore,
    streak: week.streakDays,
    fullWeek: week.week
  }))

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-foreground">
                {entry.name === 'Tempo' ? `${entry.value}h` : 
                 entry.name === 'Nota Média' ? `${entry.value}%` :
                 entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Calculate trends
  const currentWeekData = chartData[chartData.length - 1]
  const previousWeekData = chartData[chartData.length - 2]
  
  const studyTimeTrend = currentWeekData && previousWeekData 
    ? ((currentWeekData.studyTime - previousWeekData.studyTime) / previousWeekData.studyTime) * 100
    : 0

  const lessonsTrend = currentWeekData && previousWeekData
    ? ((currentWeekData.lessons - previousWeekData.lessons) / previousWeekData.lessons) * 100
    : 0

  const scoreTrend = currentWeekData && previousWeekData
    ? currentWeekData.score - previousWeekData.score
    : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine className="h-5 w-5 text-primary" />
          Progresso Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Study Time Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Tempo de Estudo (horas)
            </h3>
            {studyTimeTrend !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${
                studyTimeTrend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-3 w-3 ${studyTimeTrend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(studyTimeTrend).toFixed(1)}%
              </div>
            )}
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="studyTime"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent) / 0.2)"
                  strokeWidth={2}
                  name="Tempo"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics Chart */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Desempenho e Atividade
          </h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="lessons"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  name="Lições"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                  name="Nota Média"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <motion.div
            className="text-center p-3 bg-muted/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-accent" />
            </div>
            <div className="text-lg font-bold text-accent">
              {currentWeekData ? currentWeekData.studyTime : 0}h
            </div>
            <div className="text-xs text-muted-foreground">esta semana</div>
            {studyTimeTrend !== 0 && (
              <div className={`text-xs mt-1 ${
                studyTimeTrend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {studyTimeTrend > 0 ? '+' : ''}{studyTimeTrend.toFixed(1)}%
              </div>
            )}
          </motion.div>

          <motion.div
            className="text-center p-3 bg-muted/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">
              {currentWeekData ? currentWeekData.lessons : 0}
            </div>
            <div className="text-xs text-muted-foreground">lições</div>
            {lessonsTrend !== 0 && (
              <div className={`text-xs mt-1 ${
                lessonsTrend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {lessonsTrend > 0 ? '+' : ''}{lessonsTrend.toFixed(1)}%
              </div>
            )}
          </motion.div>

          <motion.div
            className="text-center p-3 bg-muted/30 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-secondary" />
            </div>
            <div className="text-lg font-bold text-secondary">
              {currentWeekData ? currentWeekData.score.toFixed(1) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">nota média</div>
            {scoreTrend !== 0 && (
              <div className={`text-xs mt-1 ${
                scoreTrend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {scoreTrend > 0 ? '+' : ''}{scoreTrend.toFixed(1)}
              </div>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}