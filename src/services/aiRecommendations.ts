import { GameState, Character, AIRecommendation, PredictionData } from '../types';

class AIRecommendationEngine {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Generate comprehensive recommendations for the player
   */
  generateRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Job assignment recommendations
    recommendations.push(...this.getJobAssignmentRecommendations());
    
    // Character purchase recommendations
    recommendations.push(...this.getCharacterPurchaseRecommendations());
    
    // Building upgrade recommendations
    recommendations.push(...this.getBuildingUpgradeRecommendations());
    
    // Quest focus recommendations
    recommendations.push(...this.getQuestFocusRecommendations());
    
    // Economic optimization recommendations
    recommendations.push(...this.getEconomicRecommendations());

    // Sort by confidence and expected benefit
    return recommendations
      .sort((a, b) => (b.confidence * b.expectedBenefit) - (a.confidence * a.expectedBenefit))
      .slice(0, 10); // Return top 10 recommendations
  }

  /**
   * Optimize job assignments for maximum efficiency
   */
  private getJobAssignmentRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const unassignedCharacters = this.gameState.characters.filter(c => !c.isWorking);
    
    if (unassignedCharacters.length === 0) {
      return recommendations;
    }

    // Analyze department efficiency and availability
    const departmentAnalysis = this.gameState.building.departments.map(dept => {
      const availableSlots = dept.maxCharacters - dept.currentCharacters.length;
      const efficiency = this.calculateDepartmentEfficiency(dept);
      
      return {
        department: dept,
        availableSlots,
        efficiency,
        potentialEarnings: dept.baseEarnings * dept.efficiencyBonus,
      };
    }).filter(d => d.availableSlots > 0);

    // Find optimal character-department matches
    unassignedCharacters.forEach(character => {
      const bestMatch = this.findBestDepartmentMatch(character, departmentAnalysis);
      
      if (bestMatch) {
        const expectedIncrease = this.calculateExpectedEarningsIncrease(character, bestMatch.department);
        
        recommendations.push({
          id: `job_assignment_${character.id}_${bestMatch.department.id}`,
          type: 'job_assignment',
          title: `Assign ${character.name} to ${bestMatch.department.name}`,
          description: `This assignment would increase daily earnings by approximately ${expectedIncrease.toFixed(2)} LUNC`,
          confidence: this.calculateJobMatchConfidence(character, bestMatch.department),
          expectedBenefit: expectedIncrease,
          reasoning: [
            `Character's ${this.getCharacterStrengths(character).join(', ')} skills match department requirements`,
            `Department has ${bestMatch.availableSlots} available slots`,
            `Current department efficiency: ${bestMatch.efficiency.toFixed(1)}%`,
          ],
          actionData: {
            characterId: character.id,
            departmentId: bestMatch.department.id,
            expectedEarnings: expectedIncrease,
          },
        });
      }
    });

    return recommendations;
  }

  /**
   * Recommend character purchases based on portfolio gaps
   */
  private getCharacterPurchaseRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Analyze character distribution
    const rarityDistribution = this.analyzeCharacterDistribution();
    const skillGaps = this.analyzeSkillGaps();
    
    // Recommend based on skill gaps
    if (skillGaps.length > 0) {
      const prioritySkill = skillGaps[0];
      const recommendedRarity = this.getOptimalRarityForSkill(prioritySkill.skill);
      
      recommendations.push({
        id: `character_purchase_${prioritySkill.skill}`,
        type: 'character_purchase',
        title: `Mint ${recommendedRarity} Character for ${prioritySkill.skill}`,
        description: `Your empire lacks characters with strong ${prioritySkill.skill} skills`,
        confidence: 85,
        expectedBenefit: this.calculateSkillGapBenefit(prioritySkill),
        reasoning: [
          `Current average ${prioritySkill.skill}: ${prioritySkill.current.toFixed(1)}`,
          `Recommended target: ${prioritySkill.target.toFixed(1)}`,
          `This would unlock new department positions`,
        ],
        actionData: {
          skill: prioritySkill.skill,
          recommendedRarity,
          estimatedCost: this.gameState.settings.economy.characterMintPrice[recommendedRarity],
        },
      });
    }

    // Recommend based on rarity balance
    if (rarityDistribution.needsRebalancing) {
      recommendations.push({
        id: 'rarity_rebalancing',
        type: 'character_purchase',
        title: `Balance Character Rarity Distribution`,
        description: `Consider minting ${rarityDistribution.recommendedRarity} characters`,
        confidence: 70,
        expectedBenefit: rarityDistribution.expectedBenefit,
        reasoning: [
          `Current distribution: ${rarityDistribution.current}`,
          `Optimal distribution: ${rarityDistribution.optimal}`,
          `This would improve overall efficiency`,
        ],
        actionData: {
          recommendedRarity: rarityDistribution.recommendedRarity,
          currentCount: rarityDistribution.currentCount,
          optimalCount: rarityDistribution.optimalCount,
        },
      });
    }

    return recommendations;
  }

  /**
   * Recommend building upgrades for maximum ROI
   */
  private getBuildingUpgradeRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    const availableUpgrades = this.gameState.building.upgrades.filter(u => !u.purchased && u.unlocked);
    
    availableUpgrades.forEach(upgrade => {
      const roi = this.calculateUpgradeROI(upgrade);
      const paybackPeriod = this.calculatePaybackPeriod(upgrade);
      
      if (roi > 1.2) { // Only recommend upgrades with >20% ROI
        recommendations.push({
          id: `building_upgrade_${upgrade.id}`,
          type: 'building_upgrade',
          title: `Upgrade: ${upgrade.name}`,
          description: `This upgrade offers excellent ROI and will pay for itself in ${paybackPeriod.toFixed(1)} days`,
          confidence: Math.min(95, roi * 30),
          expectedBenefit: (roi - 1) * upgrade.cost,
          reasoning: [
            `ROI: ${((roi - 1) * 100).toFixed(1)}%`,
            `Payback period: ${paybackPeriod.toFixed(1)} days`,
            `Effect: ${upgrade.effect.value}${upgrade.effect.isPercentage ? '%' : ''} ${upgrade.effect.type} boost`,
          ],
          actionData: {
            upgradeId: upgrade.id,
            cost: upgrade.cost,
            roi,
            paybackPeriod,
          },
        });
      }
    });

    return recommendations.sort((a, b) => b.expectedBenefit - a.expectedBenefit);
  }

  /**
   * Recommend quest priorities
   */
  private getQuestFocusRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    const activeQuests = this.gameState.quests.filter(q => q.isActive && !q.isCompleted);
    const prioritizedQuests = this.prioritizeQuests(activeQuests);
    
    if (prioritizedQuests.length > 0) {
      const topQuest = prioritizedQuests[0];
      
      recommendations.push({
        id: `quest_focus_${topQuest.id}`,
        type: 'quest_focus',
        title: `Focus on: ${topQuest.title}`,
        description: `This quest offers the best reward-to-effort ratio currently available`,
        confidence: 80,
        expectedBenefit: this.calculateQuestValue(topQuest),
        reasoning: [
          `Completion progress: ${topQuest.progress.completion}%`,
          `Time remaining: ${this.formatTimeRemaining(topQuest.deadline)}`,
          `Rewards: ${topQuest.rewards.map(r => `${r.amount} ${r.type}`).join(', ')}`,
        ],
        actionData: {
          questId: topQuest.id,
          nextSteps: this.getQuestNextSteps(topQuest),
        },
      });
    }

    return recommendations;
  }

  /**
   * Economic optimization recommendations
   */
  private getEconomicRecommendations(): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Cash flow analysis
    const cashFlowHealth = this.analyzeCashFlow();
    
    if (cashFlowHealth.recommendation) {
      recommendations.push({
        id: 'economic_optimization',
        type: 'building_upgrade',
        title: cashFlowHealth.title,
        description: cashFlowHealth.description,
        confidence: cashFlowHealth.confidence,
        expectedBenefit: cashFlowHealth.benefit,
        reasoning: cashFlowHealth.reasoning,
        actionData: cashFlowHealth.actionData,
      });
    }

    return recommendations;
  }

  /**
   * Calculate department efficiency based on current assignments
   */
  private calculateDepartmentEfficiency(department: any): number {
    if (department.currentCharacters.length === 0) return 0;
    
    const totalSkill = department.currentCharacters.reduce((sum: number, char: Character) => {
      return sum + this.getRelevantSkillForDepartment(char, department);
    }, 0);
    
    const averageSkill = totalSkill / department.currentCharacters.length;
    const occupancyRate = department.currentCharacters.length / department.maxCharacters;
    
    return (averageSkill / 100) * occupancyRate * 100;
  }

  /**
   * Find the best department match for a character
   */
  private findBestDepartmentMatch(character: Character, departments: any[]): any | null {
    let bestMatch = null;
    let bestScore = 0;
    
    departments.forEach(deptAnalysis => {
      const dept = deptAnalysis.department;
      const skillMatch = this.getRelevantSkillForDepartment(character, dept);
      const requirementsMet = this.checkRequirements(character, dept.requirements);
      
      if (requirementsMet) {
        const score = skillMatch * deptAnalysis.efficiency * deptAnalysis.potentialEarnings;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = deptAnalysis;
        }
      }
    });
    
    return bestMatch;
  }

  /**
   * Get the most relevant skill for a department
   */
  private getRelevantSkillForDepartment(character: Character, department: any): number {
    const skillMap: Record<string, keyof Character['skills']> = {
      management: 'management',
      it: 'intelligence',
      hr: 'charisma',
      finance: 'intelligence',
      operations: 'productivity',
      security: 'productivity',
      administration: 'productivity',
    };
    
    const relevantSkill = skillMap[department.id] || 'productivity';
    return character.skills[relevantSkill];
  }

  /**
   * Check if character meets department requirements
   */
  private checkRequirements(character: Character, requirements: any[]): boolean {
    return requirements.every(req => {
      switch (req.type) {
        case 'level':
          return character.level >= req.value;
        case 'skill':
          return character.skills[req.skill as keyof Character['skills']] >= req.value;
        case 'rarity':
          return character.rarity === req.value;
        default:
          return true;
      }
    });
  }

  /**
   * Calculate expected earnings increase from job assignment
   */
  private calculateExpectedEarningsIncrease(character: Character, department: any): number {
    const baseEarnings = character.earnings;
    const skillMultiplier = this.getRelevantSkillForDepartment(character, department) / 100;
    const departmentBonus = department.efficiencyBonus;
    
    return baseEarnings * skillMultiplier * departmentBonus;
  }

  /**
   * Get character's strongest skills
   */
  private getCharacterStrengths(character: Character): string[] {
    const skills = Object.entries(character.skills)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([skill]) => skill);
    
    return skills;
  }

  /**
   * Calculate confidence for job match
   */
  private calculateJobMatchConfidence(character: Character, department: any): number {
    const skillLevel = this.getRelevantSkillForDepartment(character, department);
    const requirementsMet = this.checkRequirements(character, department.requirements);
    
    if (!requirementsMet) return 0;
    
    const skillConfidence = Math.min(skillLevel / 80, 1) * 60; // Max 60% from skill
    const rarityBonus = character.rarity === 'Legendary' ? 30 : character.rarity === 'Rare' ? 20 : 10;
    
    return Math.min(skillConfidence + rarityBonus, 95);
  }

  /**
   * Analyze character distribution for recommendations
   */
  private analyzeCharacterDistribution(): any {
    const total = this.gameState.characters.length;
    if (total === 0) return { needsRebalancing: false };
    
    const distribution = {
      Common: this.gameState.characters.filter(c => c.rarity === 'Common').length / total,
      Rare: this.gameState.characters.filter(c => c.rarity === 'Rare').length / total,
      Legendary: this.gameState.characters.filter(c => c.rarity === 'Legendary').length / total,
    };
    
    const optimal = { Common: 0.6, Rare: 0.3, Legendary: 0.1 };
    
    // Find most unbalanced rarity
    let maxDeviation = 0;
    let recommendedRarity = 'Common';
    
    Object.entries(optimal).forEach(([rarity, optimalRatio]) => {
      const currentRatio = distribution[rarity as keyof typeof distribution];
      const deviation = optimalRatio - currentRatio;
      
      if (deviation > maxDeviation) {
        maxDeviation = deviation;
        recommendedRarity = rarity;
      }
    });
    
    return {
      needsRebalancing: maxDeviation > 0.15,
      recommendedRarity,
      currentCount: Math.floor(distribution[recommendedRarity as keyof typeof distribution] * total),
      optimalCount: Math.floor(optimal[recommendedRarity as keyof typeof optimal] * total),
      expectedBenefit: maxDeviation * 100,
      current: Object.entries(distribution).map(([r, v]) => `${r}: ${(v * 100).toFixed(0)}%`).join(', '),
      optimal: Object.entries(optimal).map(([r, v]) => `${r}: ${(v * 100).toFixed(0)}%`).join(', '),
    };
  }

  /**
   * Analyze skill gaps in the character roster
   */
  private analyzeSkillGaps(): Array<{ skill: string; current: number; target: number; gap: number }> {
    if (this.gameState.characters.length === 0) return [];
    
    const skillAverages: Record<string, number> = {};
    const skillNames = ['productivity', 'charisma', 'intelligence', 'luck', 'management', 'creativity'];
    
    skillNames.forEach(skill => {
      const total = this.gameState.characters.reduce((sum, char) => 
        sum + char.skills[skill as keyof Character['skills']], 0
      );
      skillAverages[skill] = total / this.gameState.characters.length;
    });
    
    const targets = {
      productivity: 65,
      charisma: 60,
      intelligence: 70,
      luck: 50,
      management: 55,
      creativity: 60,
    };
    
    return Object.entries(skillAverages)
      .map(([skill, current]) => ({
        skill,
        current,
        target: targets[skill as keyof typeof targets],
        gap: targets[skill as keyof typeof targets] - current,
      }))
      .filter(item => item.gap > 10)
      .sort((a, b) => b.gap - a.gap);
  }

  /**
   * Additional helper methods would continue here...
   * For brevity, I'm including the key methods. The full implementation
   * would include all referenced helper methods.
   */

  private getOptimalRarityForSkill(skill: string): string {
    return skill === 'management' ? 'Legendary' : 'Rare';
  }

  private calculateSkillGapBenefit(skillGap: any): number {
    return skillGap.gap * 2; // Simplified calculation
  }

  private calculateUpgradeROI(upgrade: any): number {
    const currentEarnings = this.gameState.economy.dailyEarnings;
    const expectedIncrease = currentEarnings * (upgrade.effect.value / 100);
    return (expectedIncrease * 30) / upgrade.cost; // 30-day ROI
  }

  private calculatePaybackPeriod(upgrade: any): number {
    const currentEarnings = this.gameState.economy.dailyEarnings;
    const expectedIncrease = currentEarnings * (upgrade.effect.value / 100);
    return upgrade.cost / expectedIncrease;
  }

  private prioritizeQuests(quests: any[]): any[] {
    return quests.sort((a, b) => {
      const aValue = this.calculateQuestValue(a);
      const bValue = this.calculateQuestValue(b);
      return bValue - aValue;
    });
  }

  private calculateQuestValue(quest: any): number {
    const rewardValue = quest.rewards.reduce((sum: number, reward: any) => {
      if (reward.type === 'lunc') return sum + reward.amount;
      if (reward.type === 'experience') return sum + (reward.amount * 0.1);
      return sum + 10; // Base value for other rewards
    }, 0);
    
    const timeBonus = quest.deadline ? 
      Math.max(0, 100 - ((new Date(quest.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
    
    return rewardValue + timeBonus;
  }

  private formatTimeRemaining(deadline?: Date): string {
    if (!deadline) return 'No deadline';
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} days`;
  }

  private getQuestNextSteps(quest: any): string[] {
    return quest.requirements
      .filter((req: any) => req.current < req.target)
      .map((req: any) => req.description);
  }

  private analyzeCashFlow(): any {
    const balance = this.gameState.economy.luncBalance;
    const dailyEarnings = this.gameState.economy.dailyEarnings;
    
    if (balance < dailyEarnings * 7) {
      return {
        recommendation: true,
        title: 'Improve Cash Flow',
        description: 'Your LUNC balance is low. Focus on earnings optimization.',
        confidence: 85,
        benefit: dailyEarnings * 5,
        reasoning: [
          `Current balance: ${balance.toFixed(2)} LUNC`,
          `Daily earnings: ${dailyEarnings.toFixed(2)} LUNC`,
          `Recommended minimum: ${(dailyEarnings * 7).toFixed(2)} LUNC`,
        ],
        actionData: {
          action: 'focus_on_earnings',
          targetBalance: dailyEarnings * 7,
        },
      };
    }
    
    return { recommendation: false };
  }
}

export default AIRecommendationEngine;

/**
 * React Hook for AI Recommendations
 */
export const useAIRecommendations = (gameState: GameState) => {
  const [recommendations, setRecommendations] = React.useState<AIRecommendation[]>([]);
  const [loading, setLoading] = React.useState(false);

  const generateRecommendations = React.useCallback(async () => {
    setLoading(true);
    try {
      const engine = new AIRecommendationEngine(gameState);
      const newRecommendations = engine.generateRecommendations();
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [gameState]);

  React.useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    loading,
    refresh: generateRecommendations,
  };
};
