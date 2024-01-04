export const getBatchs = <T extends any>(array: T[], size: number) => {
  const array_ = [...array];
  const batchs: T[][] = [];
  while (array_.length) { batchs.push(array_.splice(0, size)); } // prettier-ignore
  return batchs;
};
