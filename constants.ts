
import { MilkPowder } from './types';

export const INITIAL_MILK_POWDERS: MilkPowder[] = [
  {
    id: 'huaxia-2',
    name: '华夏 2号',
    proteinPercentage: 15.3,
    unitWeight: 9.3,
    unitName: '勺'
  },
  {
    id: 'niubeifu',
    name: '纽贝福',
    proteinPercentage: 29.7,
    unitWeight: 4.7,
    unitName: '勺'
  },
  {
    id: 'huaxia-protein',
    name: '华夏蛋白粉',
    proteinPercentage: 80,
    unitWeight: 20,
    unitName: '袋'
  }
];

export const PROTEIN_FORMULA_COEFF_1 = 2.1;
export const PROTEIN_FORMULA_COEFF_2 = 0.8;
