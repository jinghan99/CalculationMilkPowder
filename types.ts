
export interface MilkPowder {
  id: string;
  name: string;
  proteinPercentage: number; // protein per 100g
  unitWeight: number; // weight of one scoop/sachet in grams
  unitName: string; // "勺" (scoop) or "袋" (sachet)
}

export interface IntakeLog {
  productId: string;
  quantity: number;
}
