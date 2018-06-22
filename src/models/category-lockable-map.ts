import { DocumentReference } from '@google-cloud/firestore';

import { FirestoreData, index } from '../helpers/firestore-data-annotations';

export interface GenericCategoryLockableMapData {
    lockableRef: DocumentReference;
    category: string;
}

export interface CategoryLockableMapData {
    id: string;
    lockableRef: DocumentReference;
    categoryRef: string;
}

export class CategoryLockableMap extends FirestoreData {

    @index()
    public id: string;

    public lockableRef: DocumentReference;
    public category: string;

    public constructor(data: CategoryLockableMapData) {
        super();
        this.id = data.id;
        this.lockableRef = data.lockableRef;
        this.category = data.categoryRef;
    }
}