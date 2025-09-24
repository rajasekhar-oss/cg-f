
export interface Card {
  id: number;
  name: string;
  imageUrl: string;
  picture?: string;
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
  name: string;
  imageUrl: string;
  totalFilms: number;
  yearsActive: number;
  highestGrossing: string;
  awardsWon: number;
  followers: string;
  languages: number;
  professions: number;
}
