import { CategoryLockableMap, GenericCategoryLockableMapData } from '../models/category-lockable-map';
import { Paginate, PaginationResults } from '../models/paginate';

export interface CategoryLockableMapService {
    create(categoryLockableMap: GenericCategoryLockableMapData): Promise<CategoryLockableMap>;
    retrieve<U extends keyof CategoryLockableMap>(fieldPath: U, value: CategoryLockableMap[U]): Promise<CategoryLockableMap>;
    update(categoryLockableMap: CategoryLockableMap): Promise<CategoryLockableMap>;
    delete<U extends keyof CategoryLockableMap>(fieldPath: U, value: CategoryLockableMap[U]): Promise<boolean>;
    paginate(paginate: Paginate<CategoryLockableMap>): Promise<PaginationResults<CategoryLockableMap>>;
}