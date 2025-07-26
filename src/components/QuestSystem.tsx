import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, Target, Gift, CheckCircle, 
  XCircle, Star, Calendar, Award, Zap 
} from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { Quest, QuestReward } from '../types';
import './QuestSystem.css';

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string) => void;
  onClaim: (questId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, onClaim }) => {
  const getQuestTypeIcon = () => {
    switch (quest.type) {
      case 'daily': return <Calendar className="w-5 h-5" />;
      case 'weekly': return <Clock className="w-5 h-5" />;
      case 'monthly': return <Trophy className="w-5 h-5" />;
      case 'special': return <Star className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getQuestTypeColor = () => {
    switch (quest.type) {
      case 'daily': return '#10b981';
      case 'weekly': return '#3b82f6';
      case 'monthly': return '#8b5cf6';
      case 'special': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = () => {
    switch (quest.category) {
      case 'collection': return <Gift className="w-4 h-4" />;
      case 'building': return <Target className="w-4 h-4" />;
      case 'social': return <Trophy className="w-4 h-4" />;
      case 'earning': return <Zap className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = () => {
    if (!quest.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(quest.deadline);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const canComplete = quest.requirements.every(req => req.current >= req.target);
  const isExpired = quest.deadline && new Date(quest.deadline) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`quest-card ${quest.type} ${quest.isCompleted ? 'completed' : ''} ${isExpired ? 'expired' : ''}`}
    >
      <div className="quest-header">
        <div className="quest-type" style={{ color: getQuestTypeColor() }}>
          {getQuestTypeIcon()}
          <span className="quest-type-label">{quest.type}</span>
        </div>
        <div className="quest-category">
          {getCategoryIcon()}
        </div>
      </div>

      <div className="quest-content">
        <h3 className="quest-title">{quest.title}</h3>
        <p className="quest-description">{quest.description}</p>

        <div className="quest-requirements">
          {quest.requirements.map((req, index) => (
            <div key={req.id} className="requirement">
              <div className="requirement-info">
                <span className="requirement-desc">{req.description}</span>
                <span className="requirement-progress">
                  {req.current} / {req.target}
                </span>
              </div>
              <div className="requirement-bar">
                <div 
                  className="requirement-fill"
                  style={{ 
                    width: `${Math.min((req.current / req.target) * 100, 100)}%`,
                    backgroundColor: getQuestTypeColor()
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="quest-rewards">
          <h4>Rewards:</h4>
          <div className="rewards-list">
            {quest.rewards.map((reward, index) => (
              <div key={index} className="reward-item">
                <RewardIcon type={reward.type} />
                <span>{reward.amount} {reward.type.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quest-footer">
        {quest.deadline && (
          <div className="quest-deadline">
            <Clock className="w-4 h-4" />
            <span>{formatTimeRemaining()}</span>
          </div>
        )}

        <div className="quest-actions">
          {quest.isCompleted ? (
            <button 
              className="quest-btn claim-btn"
              onClick={() => onClaim(quest.id)}
            >
              <Gift className="w-4 h-4" />
              Claim Rewards
            </button>
          ) : canComplete ? (
            <button 
              className="quest-btn complete-btn"
              onClick={() => onComplete(quest.id)}
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
          ) : isExpired ? (
            <button className="quest-btn expired-btn" disabled>
              <XCircle className="w-4 h-4" />
              Expired
            </button>
          ) : (
            <div className="quest-progress-indicator">
              <div className="progress-circle">
                <span>{quest.progress.completion}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RewardIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'lunc': return <span className="reward-icon lunc">₿</span>;
    case 'experience': return <span className="reward-icon xp">XP</span>;
    case 'character': return <span className="reward-icon character">👤</span>;
    case 'decoration': return <span className="reward-icon decoration">🎨</span>;
    case 'title': return <span className="reward-icon title">🏆</span>;
    default: return <span className="reward-icon default">🎁</span>;
  }
};

interface QuestFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  questCounts: Record<string, number>;
}

const QuestFilter: React.FC<QuestFilterProps> = ({ activeFilter, onFilterChange, questCounts }) => {
  const filters = [
    { id: 'all', label: 'All Quests', count: questCounts.total },
    { id: 'active', label: 'Active', count: questCounts.active },
    { id: 'daily', label: 'Daily', count: questCounts.daily },
    { id: 'weekly', label: 'Weekly', count: questCounts.weekly },
    { id: 'completed', label: 'Completed', count: questCounts.completed },
  ];

  return (
    <div className="quest-filters">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
          <span className="filter-count">{filter.count}</span>
        </button>
      ))}
    </div>
  );
};

const QuestSystem: React.FC = () => {
  const { gameState, completeQuest, updateQuestProgress } = useGameContext();
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // Auto-update quest progress based on game state
  useEffect(() => {
    gameState.quests.forEach(quest => {
      if (quest.isActive && !quest.isCompleted) {
        quest.requirements.forEach(req => {
          let newProgress = 0;
          
          switch (req.category) {
            case 'minting':
              newProgress = gameState.characters.length;
              break;
            case 'collection':
              // Count earnings collections (simplified)
              newProgress = gameState.economy.transactions.filter(t => 
                t.type === 'earnings' && t.description.includes('earnings')
              ).length;
              break;
            case 'building':
              newProgress = gameState.building.upgrades.filter(u => u.purchased).length;
              break;
            case 'social':
              newProgress = gameState.social.friends.length;
              break;
            default:
              break;
          }
          
          if (newProgress !== req.current) {
            const questProgress = (newProgress / req.target) * 100;
            updateQuestProgress(quest.id, Math.min(questProgress, 100));
          }
        });
      }
    });
  }, [gameState, updateQuestProgress]);

  const getFilteredQuests = () => {
    let filtered = gameState.quests;
    
    switch (activeFilter) {
      case 'active':
        filtered = gameState.quests.filter(q => q.isActive && !q.isCompleted);
        break;
      case 'daily':
        filtered = gameState.quests.filter(q => q.type === 'daily');
        break;
      case 'weekly':
        filtered = gameState.quests.filter(q => q.type === 'weekly');
        break;
      case 'completed':
        filtered = gameState.quests.filter(q => q.isCompleted);
        break;
      default:
        break;
    }
    
    return filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      if (a.type !== b.type) {
        const typeOrder = { special: 0, daily: 1, weekly: 2, monthly: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return 0;
    });
  };

  const getQuestCounts = () => {
    return {
      total: gameState.quests.length,
      active: gameState.quests.filter(q => q.isActive && !q.isCompleted).length,
      daily: gameState.quests.filter(q => q.type === 'daily').length,
      weekly: gameState.quests.filter(q => q.type === 'weekly').length,
      completed: gameState.quests.filter(q => q.isCompleted).length,
    };
  };

  const handleCompleteQuest = (questId: string) => {
    completeQuest(questId);
  };

  const handleClaimQuest = (questId: string) => {
    // Claims are automatically processed in completeQuest
    const quest = gameState.quests.find(q => q.id === questId);
    if (quest?.isCompleted) {
      // Remove from active quests or mark as claimed
      console.log(`Claiming rewards for quest: ${quest.title}`);
    }
  };

  const filteredQuests = getFilteredQuests();
  const questCounts = getQuestCounts();

  return (
    <div className="quest-system">
      <div className="quest-header">
        <div className="quest-title-section">
          <h1>
            <Trophy className="w-8 h-8" />
            Quest System
          </h1>
          <p>Complete quests to earn valuable rewards and progress in your empire!</p>
        </div>

        <div className="quest-stats">
          <div className="stat-card">
            <div className="stat-value">{questCounts.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{questCounts.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {gameState.quests.reduce((sum, q) => 
                sum + q.rewards.filter(r => r.type === 'lunc').reduce((luncSum, r) => luncSum + r.amount, 0), 0
              )}
            </div>
            <div className="stat-label">LUNC Available</div>
          </div>
        </div>
      </div>

      <QuestFilter 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        questCounts={questCounts}
      />

      <div className="quest-content">
        {filteredQuests.length === 0 ? (
          <div className="empty-state">
            <Trophy className="w-16 h-16 text-gray-400" />
            <h3>No quests available</h3>
            <p>Check back later for new challenges!</p>
          </div>
        ) : (
          <div className="quest-grid">
            <AnimatePresence>
              {filteredQuests.map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  onClaim={handleClaimQuest}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quest Detail Modal */}
      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="quest-modal-overlay"
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="quest-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedQuest.title}</h2>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedQuest(null)}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="quest-detail-description">
                  <p>{selectedQuest.description}</p>
                </div>
                
                <div className="quest-detail-requirements">
                  <h3>Requirements:</h3>
                  {selectedQuest.requirements.map(req => (
                    <div key={req.id} className="detail-requirement">
                      <span>{req.description}</span>
                      <span className="req-progress">
                        {req.current} / {req.target}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="quest-detail-rewards">
                  <h3>Rewards:</h3>
                  {selectedQuest.rewards.map((reward, index) => (
                    <div key={index} className="detail-reward">
                      <RewardIcon type={reward.type} />
                      <span>{reward.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestSystem;
