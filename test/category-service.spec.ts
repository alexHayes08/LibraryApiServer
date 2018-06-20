// import { describe, expect, it } from 'jest';

import { container, TYPES } from '../src/dependency-registrar';
import { Category } from '../src/models/category';
import { CategoryService } from '../src/services/category-service';

describe('category-service', () => {
    describe('#create', () => {
        it('Should create a new category named testA by only passing in string.', async () => {
            const categoryService =
                container.get<CategoryService>(TYPES.CategoryService);
            const category = await categoryService.create('Test');

            expect(category.name).toBe('Test');
        });
    });

    it('Should create a new category named testA by only passing in a category.', async () => {
        const categoryService =
            container.get<CategoryService>(TYPES.CategoryService);
        const initialCategory = new Category({
            id: 'Test',
            name: 'Test'
        });
        const finalCategory = await categoryService.create(initialCategory);

        expect(finalCategory).toBe(initialCategory);
    });
});