import React, { useState } from 'react';
import DailySurvey from './DailySurvey';

const MetricCard = ({ title, description }) => {
  const [timePeriod, setTimePeriod] = useState('7D');

  return (
    <div className="rounded-xl border border-border bg-card p-6 min-h-[300px] flex flex-col">
      {/* Header with Title and Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimePeriod('7D')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              timePeriod === '7D'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimePeriod('30D')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              timePeriod === '30D'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">{description}</p>
          <p className="text-sm text-muted-foreground">Showing {timePeriod} data</p>
        </div>
      </div>
    </div>
  );
};

export default function ClientDashboard() {
  const metrics = [
    {
      title: 'Bodyweight Change',
      description: 'Area Chart slot - Track your weight trends',
    },
    {
      title: 'Strength Progress',
      description: 'Line Chart slot - 1RM and Volume tracking',
    },
    {
      title: 'Calorie & Nutrition',
      description: 'Bar Chart slot - Macros breakdown',
    },
    {
      title: 'Daily Steps',
      description: 'Bar Chart slot - Daily step counts',
    },
    {
      title: 'Mood History',
      description: 'Line Chart slot - Survey trends over time',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Client</h1>
      </div>

      {/* Grid Layout - 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Survey */}
        <DailySurvey />

        {/* Bodyweight Change */}
        <MetricCard
          title={metrics[0].title}
          description={metrics[0].description}
        />

        {/* Strength Progress */}
        <MetricCard
          title={metrics[1].title}
          description={metrics[1].description}
        />

        {/* Calorie & Nutrition */}
        <MetricCard
          title={metrics[2].title}
          description={metrics[2].description}
        />

        {/* Daily Steps */}
        <MetricCard
          title={metrics[3].title}
          description={metrics[3].description}
        />

        {/* Mood History */}
        <MetricCard
          title={metrics[4].title}
          description={metrics[4].description}
        />
      </div>
    </div>
  );
}
