import 'reflect-metadata';
import { Container } from 'inversify';

export const TYPES = {
    StaticCache: Symbol.for('StaticCache'),
    InstancedCache: Symbol.for('InstanceCache'),
    CategoryService: Symbol.for('CategoryService'),
    CategoryLockableMapService: Symbol.for('CategoryLockableMapService'),
    Database: Symbol.for('Database'),
    LockableService: Symbol.for('LockableService')
};

// Set up container.
const container = new Container();

import { Database, FSDatabase } from './models/database';
container.bind<Database>(TYPES.Database)
    .toConstantValue(FSDatabase);

import { CacheService } from './services/cache-service';
container
    .bind<CacheService>(TYPES.StaticCache)
    .toConstantValue(new CacheService());

container
    .bind<CacheService>(TYPES.InstancedCache)
    .to(CacheService);

import { CategoryService } from './services/category-service';
import { FirestoreCategoryService } from './services/firestore-category-service';
container
    .bind<CategoryService>(TYPES.CategoryService)
    .to(FirestoreCategoryService);

import { LockableService } from './services/lockable-service';
import { FirestoreLockableService } from './services/firestore-lockable-service';
container
    .bind<LockableService>(TYPES.LockableService)
    .to(FirestoreLockableService);

import { CategoryLockableMapService } from './services/category-lockable-map-service';
import { FirestoreCategoryLockableMapService } from './services/firestore-category-lockable-map-service';
container
    .bind<CategoryLockableMapService>(TYPES.CategoryLockableMapService)
    .to(FirestoreCategoryLockableMapService);

export { container };