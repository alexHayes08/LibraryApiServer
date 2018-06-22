// FIXME: This file will probably be deleted.

import { exclude, FirestoreData, index } from '../helpers/firestore-data-annotations';

export interface CategoryData {
    id: string;
    name: string;
    path: string;
}

export class Category extends FirestoreData implements CategoryData {

    @index()
    public id: string;

    public name: string;

    @exclude()
    public path: string;

    public constructor(data: CategoryData) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.path = data.path;
    }
}
