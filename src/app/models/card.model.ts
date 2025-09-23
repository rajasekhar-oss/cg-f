export interface Card {
  id: number;
  totalFilms: number;
  yearsActive: number;
  highestGrossing: string;
  awardsWon: number;
  followers: string;
  languages: number;
  professions: number;
  user?: any;
  stored?: boolean;
  orderIndex?: number;
}

export interface CardRequestDto {
  totalFilms: number;
  yearsActive: number;
  highestGrossing: string;
  awardsWon: number;
  followers: string;
  languages: number;
  professions: number;
}
