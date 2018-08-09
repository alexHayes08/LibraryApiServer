export interface GenericCategoryLockableMapData {
    // lockableRef: DocumentReference;
    category: string;
}

export interface CategoryLockableMapData {
    id: string;
    categoryRef: string;
}

export class CategoryLockableMap {
    public id: string;
    public category: string;

    public constructor(data: CategoryLockableMapData) {
        this.id = data.id;
        // this.lockableRef = data.lockableRef;
        this.category = data.categoryRef;
    }
}