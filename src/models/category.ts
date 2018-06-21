import { index, exclude, FirestoreData } from '../helpers/firestore-data-annotations';

export interface CategoryData {
    id: string;
    name: string;
    parentCategoryIds?: string[];
}

export class Category extends FirestoreData implements CategoryData {

    @index()
    public id: string;

    public name: string;

    @exclude()
    public parentCategoryIds?: string[];

    public constructor(data: CategoryData) {
        super();
        this.id = data.id;
        this.name = data.name;
        this.parentCategoryIds = data.parentCategoryIds;
    }
}
