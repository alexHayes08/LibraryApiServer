import { Container } from 'inversify';
import { Database, FSDatabase } from './models/database';

export const TYPES = {
    Database: Symbol.for('Database'),
    CategoryService: Symbol.for('CategoryService')
};

const container = new Container();
container.bind<Database>(TYPES.Database)
    .toConstantValue(FSDatabase);

import { CategoryService } from './services/category-service';
import { FirestoreCategoryService } from './services/firestore-category-service';

container
    .bind<CategoryService>(TYPES.CategoryService)
    .to(FirestoreCategoryService);

export { container };