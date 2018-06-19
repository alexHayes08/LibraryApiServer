import { Container } from 'inversify';
import { CategoryService } from './services/category-service';
import { FirestoreCategoryService } from './services/firestore-category-service';

export const TYPES = {
    SitePoolService: Symbol.for('SitePoolService')
};

const container = new Container();
container
    .bind<CategoryService>(TYPES.SitePoolService)
    .to(FirestoreCategoryService);

export { container };