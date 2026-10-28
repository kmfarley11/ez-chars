import type { Item5e2014 } from '../../../schema/system.5e2014';

export type InventoryGroup = Item5e2014['category'];

// Classification is authored data. Names and arbitrary tags never move a record.
export const getInventoryGroupForItem = (item: Item5e2014): InventoryGroup => item.category;
