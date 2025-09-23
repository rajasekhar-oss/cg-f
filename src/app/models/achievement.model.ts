export interface Achievement {
  id: number;
  name: string;
  description: string;
  requiredCards: number[];
  rewardCardId?: number;
  rewardTag?: string;
}

export interface AchievementDto {
  name: string;
  description: string;
  requiredCards: number[];
  rewardCardId?: number;
  rewardTag?: string;
}
