import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Building, 
  Activity, Target, Clock, Star, Zap 
} from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { useAnalytics } from '../hooks/useAnalytics';
import './AnalyticsDashboard.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, color }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="analytics-metric-card"
      style={{ borderLeftColor: color }}
    >
      <div className="metric-header">
        <div className="metric-icon" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <div className="metric-trend">
          {getTrendIcon()}
          <span className={getTrendColor()}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <p className="metric-value">{value}</p>
      </div>
    </motion.div>
  );
};

interface ChartSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({ title, children, className }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`chart-section ${className || ''}`}
  >
    <h3 className="chart-title">{title}</h3>
    <div className="chart-content">
      {children}
    </div>
  </motion.div>
);

const AnalyticsDashboard: React.FC = () => {
  const { gameState } = useGameContext();
  const { data, isLoading, trackEvent } = useAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'economics' | 'performance'>('overview');

  useEffect(() => {
    trackEvent({
      id: Date.now().toString(),
      type: 'analytics_view',
      data: { tab: activeTab, period: selectedPeriod },
      timestamp: new Date(),
      userId: gameState.user.id,
    });
  }, [activeTab, selectedPeriod, trackEvent, gameState.user.id]);

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  const renderOverviewTab = () => (
    <>
      <div className="metrics-grid">
        <MetricCard
          title="Total Earnings"
          value={`${gameState.economy.totalEarnings.toFixed(2)} LUNC`}
          change={15.2}
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="#10b981"
        />
        <MetricCard
          title="Active Characters"
          value={gameState.characters.filter(c => c.isWorking).length}
          change={8.5}
          trend="up"
          icon={<Users className="w-6 h-6" />}
          color="#3b82f6"
        />
        <MetricCard
          title="Building Efficiency"
          value={`${gameState.building.efficiency}%`}
          change={2.1}
          trend="up"
          icon={<Building className="w-6 h-6" />}
          color="#8b5cf6"
        />
        <MetricCard
          title="Daily Income"
          value={`${data?.performanceMetrics?.find(m => m.name === 'Daily Income')?.value || 0} LUNC`}
          change={-3.2}
          trend="down"
          icon={<Activity className="w-6 h-6" />}
          color="#f59e0b"
        />
      </div>

      <div className="charts-grid">
        <ChartSection title="Earnings History" className="large-chart">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.earningsHistory || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                fill="#10b98120" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Character Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.characterDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(data?.characterDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>
    </>
  );

  const renderCharactersTab = () => (
    <>
      <div className="character-stats-grid">
        <div className="character-breakdown">
          <h4>Character Breakdown by Rarity</h4>
          <div className="rarity-stats">
            {['Common', 'Rare', 'Legendary'].map(rarity => {
              const count = gameState.characters.filter(c => c.rarity === rarity).length;
              const percentage = gameState.characters.length > 0 
                ? (count / gameState.characters.length * 100).toFixed(1) 
                : 0;
              
              return (
                <div key={rarity} className="rarity-stat">
                  <div className="rarity-info">
                    <span className={`rarity-badge ${rarity.toLowerCase()}`}>{rarity}</span>
                    <span className="rarity-count">{count}</span>
                  </div>
                  <div className="rarity-bar">
                    <div 
                      className={`rarity-fill ${rarity.toLowerCase()}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="rarity-percentage">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="character-performance">
          <h4>Top Performing Characters</h4>
          <div className="character-list">
            {gameState.characters
              .sort((a, b) => b.earnings - a.earnings)
              .slice(0, 5)
              .map((character, index) => (
                <div key={character.id} className="character-item">
                  <div className="character-rank">#{index + 1}</div>
                  <div className="character-info">
                    <span className="character-name">{character.name}</span>
                    <span className="character-department">
                      {character.department?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="character-earnings">
                    {character.earnings.toFixed(2)} LUNC/day
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <ChartSection title="Character Level Distribution">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={generateLevelDistribution(gameState.characters)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="level" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    </>
  );

  const renderEconomicsTab = () => (
    <>
      <div className="economics-overview">
        <div className="balance-card">
          <h4>Current Balance</h4>
          <p className="balance-amount">{gameState.economy.luncBalance.toFixed(2)} LUNC</p>
          <span className="balance-usd">≈ ${(gameState.economy.luncBalance * data?.marketData?.luncPrice || 0).toFixed(4)} USD</span>
        </div>

        <div className="transaction-summary">
          <h4>Recent Transactions</h4>
          <div className="transaction-stats">
            <div className="transaction-stat">
              <span className="stat-label">Total Income</span>
              <span className="stat-value text-green-500">
                +{gameState.economy.transactions
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)} LUNC
              </span>
            </div>
            <div className="transaction-stat">
              <span className="stat-label">Total Expenses</span>
              <span className="stat-value text-red-500">
                {gameState.economy.transactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toFixed(2)} LUNC
              </span>
            </div>
          </div>
        </div>
      </div>

      <ChartSection title="Income vs Expenses">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={generateIncomeExpenseData(gameState.economy.transactions)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartSection>
    </>
  );

  const renderPerformanceTab = () => (
    <>
      <div className="performance-metrics">
        {data?.performanceMetrics?.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="performance-metric"
          >
            <div className="metric-header">
              <h4>{metric.name}</h4>
              <span className={`metric-trend ${metric.trend}`}>
                {metric.trend === 'up' ? <TrendingUp /> : 
                 metric.trend === 'down' ? <TrendingDown /> : <Activity />}
              </span>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-change">
              {metric.change > 0 ? '+' : ''}{metric.change}% from last period
            </div>
          </motion.div>
        )) || []}
      </div>

      <ChartSection title="Goal Progress">
        <div className="goals-grid">
          {data?.goalProgress?.map((goal, index) => (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h5>{goal.name}</h5>
                <span className="goal-percentage">
                  {((goal.current / goal.target) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="goal-progress-bar">
                <div 
                  className="goal-progress-fill"
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="goal-details">
                <span>{goal.current} / {goal.target}</span>
                {goal.deadline && (
                  <span className="goal-deadline">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )) || []}
        </div>
      </ChartSection>
    </>
  );

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Analytics Dashboard</h1>
        
        <div className="dashboard-controls">
          <div className="period-selector">
            {(['7d', '30d', '90d'] as const).map(period => (
              <button
                key={period}
                className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity /> },
          { id: 'characters', label: 'Characters', icon: <Users /> },
          { id: 'economics', label: 'Economics', icon: <DollarSign /> },
          { id: 'performance', label: 'Performance', icon: <Target /> },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'characters' && renderCharactersTab()}
            {activeTab === 'economics' && renderEconomicsTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper functions
const generateLevelDistribution = (characters: any[]) => {
  const distribution: Record<number, number> = {};
  characters.forEach(char => {
    distribution[char.level] = (distribution[char.level] || 0) + 1;
  });
  
  return Object.entries(distribution).map(([level, count]) => ({
    level: `Level ${level}`,
    count,
  }));
};

const generateIncomeExpenseData = (transactions: any[]) => {
  const groupedByDate: Record<string, { income: number; expenses: number }> = {};
  
  transactions.forEach(tx => {
    const date = new Date(tx.timestamp).toLocaleDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = { income: 0, expenses: 0 };
    }
    
    if (tx.amount > 0) {
      groupedByDate[date].income += tx.amount;
    } else {
      groupedByDate[date].expenses += Math.abs(tx.amount);
    }
  });
  
  return Object.entries(groupedByDate).map(([date, data]) => ({
    date,
    ...data,
  }));
};

export default AnalyticsDashboard;
