import { index, exclude } from '../helpers/firestore-data-annotations';

export interface CategoryData {
    id: string;
    name: string;
    parentCategoryIds?: string[];
}

export class Category implements CategoryData {

    @index()
    public id: string;

    public name: string;

    @exclude()
    public parentCategoryIds?: string[];

    public constructor(data: CategoryData) {
        this.id = data.id;
        this.name = data.name;
        this.parentCategoryIds = data.parentCategoryIds;
    }
}
