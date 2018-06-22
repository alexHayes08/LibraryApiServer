import { Category } from '../models/category';
import { CrudPlusPattern } from './crud-plus-pattern';

export interface CategoryService extends CrudPlusPattern<Category, string|Category, Category> {

    /**
     * Creates a SitePool.
     * @param category If a string is passed in a default SitePool should be
     * created in the db.
     */
    create(category: Category|string, parentCategoryIds?: string[]): Promise<Category>;

    retrieve<U extends keyof Category>(fieldName: U, value: Category[U], parentCategoryNames?: string[]): Promise<Category>;

    /**
     * Retrieves all child categories in a category.
     * @param category
     */
    getChildCategories(category: Category): Promise<Category[]>;
}
