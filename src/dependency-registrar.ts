import 'reflect-metadata';
import { Container } from 'inversify';

// Importing this will init mongoose.
import './config/mongoose.config';

export const TYPES = {
    StaticCache: Symbol.for('StaticCache'),
    InstancedCache: Symbol.for('InstanceCache'),
    CategoryLockableMapService: Symbol.for('CategoryLockableMapService'),
    Database: Symbol.for('Database'),
    LockableService: Symbol.for('LockableService'),
    LockService: Symbol.for('LockService')
};

// Set up container.
const container = new Container();

import { CacheService } from './services/cache-service';
container
    .bind<CacheService>(TYPES.StaticCache)
    .toConstantValue(new CacheService());

container
    .bind<CacheService>(TYPES.InstancedCache)
    .to(CacheService);

import { LockService } from './services/lock-service';
import { MongoLockService } from './services/mongo-lock-service';
container
    .bind<LockService>(TYPES.LockService)
    .to(MongoLockService);

import { LockableService } from './services/lockable-service';
import { MongoLockableService } from './services/mongo-lockable-service';
container
    .bind<LockableService>(TYPES.LockableService)
    .to(MongoLockableService);

export { container };