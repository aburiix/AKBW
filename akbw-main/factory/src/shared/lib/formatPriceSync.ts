/**
 * Sync format price. No label/locale awareness for simplicity in client components.
 * @param amount Price
 * @returns string. Ex. X XXX XXX
 */
export const formatPriceSync = (amount: number | string) => {
  const dollars = String(amount).split('.')[0];
  return dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};
