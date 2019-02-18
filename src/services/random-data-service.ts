import { CrudPlusPattern } from './crud-plus-pattern';
import { GenericRandomData, RandomData, GenericRandomDataItem, RandomDataItem } from '../models/random-data';
import { PaginationResults, Paginate } from '../models/paginate';

/**
 * Used for managing 'random' data. Data is organized groups which are
 * case-insensitive.
 */
export interface RandomDataService extends CrudPlusPattern<RandomData, GenericRandomData> {

    /**
     * Retrieves a random entry from a group and marks it as used recently.
     * @param groupName Case-insensitive name of the group.
     */
    getRandomRecord(groupName: string): Promise<GenericRandomDataItem>;

    /**
     * Creates the item.
     * @param groupName Case-insensitive name of the group.
     * @param model The data to populate the created item with.
     */
    createDataItem(groupName: string, model: GenericRandomDataItem): Promise<RandomDataItem>;

    /**
     * Creates multiple data items.
     * @param groupName Case-insensitive name of the group.
     * @param randomDataItem Bulk version of createDataItem.
     */
    createManyDataItem(groupName: string, randomDataItem: GenericRandomDataItem[]): Promise<PaginationResults<RandomDataItem>>;

    /**
     * Retrieves the data item.
     * @param groupName Case-insensitive name of the group.
     * @param fieldName Name of the field to retrieve the data item with.
     * @param value The value associated with the field name.
     */
    retrieveDataItem<V extends keyof RandomDataItem>(groupName: V, fieldName: string, value: RandomDataItem[V]): Promise<RandomDataItem>;

    /**
     * Saves the changes to the model.
     * @param groupName Case-insensitive name of the group.
     * @param model The updated data item values.
     */
    updateDataItem(groupName: string, model: RandomDataItem): Promise<RandomDataItem>;

    /**
     * Bulk version of updateDataItem.
     * @param groupName Case-insensitive name of the group.
     * @param models The models to update.
     */
    updateManyDataItem(groupName: string, models: RandomDataItem[]): Promise<PaginationResults<RandomDataItem>>;

    /**
     * Deletes the data item.
     * @param groupName Case-insensitive name of the group.
     * @param fieldName The field name to identify the item being deleted.
     * @param value The value of the field.
     */
    deleteDataItem<V extends keyof RandomDataItem>(groupName: string, fieldName: V, value: RandomDataItem[V]): Promise<boolean>;

    /**
     * Bulk version of deleteDataItem.
     * @param groupName Case-insensitive name of the group.
     * @param fieldName The field name to identify the item being deleted.
     * @param values The values of the field.
     */
    deleteManyDataItem<V extends keyof RandomDataItem>(groupName: string, fieldName: V, values: RandomDataItem[V][]): Promise<boolean>;

    /**
     * Paginates the data items of a collection.
     * @param groupName The name of the groupName the items belong to.
     * @param data The pagination options.
     */
    paginateDataItem(groupName: string, data: Paginate<RandomDataItem>): Promise<PaginationResults<RandomDataItem>>;
}
