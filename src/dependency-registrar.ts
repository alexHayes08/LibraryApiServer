import 'reflect-metadata';
import { Container } from 'inversify';

// Importing this will init mongoose.
import './config/mongoose.config';

export const TYPES = {
    StaticCache: Symbol.for('StaticCache'),
    InstancedCache: Symbol.for('InstanceCache'),
    CategoryLockableMapService: Symbol.for('CategoryLockableMapService'),
    Database: Symbol.for('Database'),
    LockableService: Symbol.for('LockableService')
};

// Set up container.
const container = new Container();

// import { Database, FSDatabase } from './models/database';
// container.bind<Database>(TYPES.Database)
//     .toConstantValue(FSDatabase);

import { CacheService } from './services/cache-service';
container
    .bind<CacheService>(TYPES.StaticCache)
    .toConstantValue(new CacheService());

container
    .bind<CacheService>(TYPES.InstancedCache)
    .to(CacheService);

import { LockableService } from './services/lockable-service';
import { MongoLockableService } from './services/mongo-lockable-service';
container
    .bind<LockableService>(TYPES.LockableService)
    .to(MongoLockableService);

// import { CategoryLockableMapService } from './services/category-lockable-map-service';
// import { FirestoreCategoryLockableMapService } from './services/firestore-category-lockable-map-service';
// container
//     .bind<CategoryLockableMapService>(TYPES.CategoryLockableMapService)
//     .to(FirestoreCategoryLockableMapService);

export { container };