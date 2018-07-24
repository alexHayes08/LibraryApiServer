import { container, TYPES } from '../src/dependency-registrar';
import { CategoryLockableMap } from '../src/models/category-lockable-map';
import { CategoryLockableMapService } from '../src/services/category-lockable-map-service';
import { LockableService } from '../src/services/lockable-service';

describe('category-service', () => {
    describe('#create', () => {
        it('Should create a new category named testA by only passing in string.', async () => {
            const categoryService = container
                .get<CategoryLockableMapService>(TYPES.CategoryLockableMapService);
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);
            const lockable = await lockableService.retrieve('name', 'alex');
            const category = await categoryService.create({
                lockableRef: lockable,
                category: "test"
            });

            expect(category.name).toBe('Test');
        });
    });

    it('Should create a new category named testA by only passing in a category.', async () => {
        const categoryService =
            container.get<CategoryService>(TYPES.CategoryService);
        const initialCategory = new Category({
            id: 'Test',
            name: 'Test',
            path: 'Test'
        });
        const finalCategory = await categoryService.create(initialCategory);

        expect(finalCategory).toBe(initialCategory);
    });
});