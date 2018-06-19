import { index } from './decorators';
import { inject } from 'inversify';

import { CategoryService } from '../services/category-service';
import { TYPES } from '../dependency-registrar';
import { Updatable } from './updatable';

export interface CategoryData {
    id: string;
    name: string;
    parentCategoryIds?: string[];
}

export class Category implements CategoryData, Updatable<Category> {
    @index
    public id: string;

    @index
    public name: string;

    public parentCategoryIds?: string[];

    public constructor(data: CategoryData,
        @inject(TYPES.SitePoolService) private categoryService: CategoryService) {
        this.id = data.id;
        this.name = data.name;
        this.parentCategoryIds = data.parentCategoryIds;
    }

    public update(): Promise<Category> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.categoryService.update(self);
            resolve(this);
        });
    }
}
