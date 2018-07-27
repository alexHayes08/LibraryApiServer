import mongoose, { Types } from 'mongoose';

import { container, TYPES } from '../src/dependency-registrar';
import { LockableService } from '../src/services/lockable-service';
import { Lockable } from '../src/models/lockable';
import { LockModel } from '../src/config/mongoose.config';

const generateAfterEach = function(lockables: Lockable[]) {
    return async () => {
        const lockableService = container
            .get<LockableService>(TYPES.LockableService);

        while (lockables.length > 0) {
            const lockable = lockables.pop();
            await lockableService.delete('id', lockable.id);
        }
    };
};

const generateLockables = function(numberOfLockables: number, lockableService: LockableService): Promise<Lockable[]> {
    return new Promise(function(resolve, reject) {
        const lockables: Lockable[] = [];
        const promises = [];

        for (let i = 1; i <= numberOfLockables; i++) {
            promises.push(lockableService.create({
                name: `TestV${i}`,
                createdOn: new Date(),
                categories: [
                    'blue',
                    'purple'
                ],
                data: { }
            })
            .then(lockable => lockables.push(lockable))
            .catch(error => reject(error)));
        }

        Promise.all(promises)
            .then(() => resolve(lockables));
    });
};

describe('lockable-service', () => {
    describe('#create', () => {
        it('Should create a new lockable named \'Test\'.', async () => {
            const lockableService =
                container.get<LockableService>(TYPES.LockableService);

            const lockable: Lockable = await lockableService.create({
                name: 'Test',
                createdOn: new Date(),
                categories: [
                    'Test Category A',
                    'Test Category B'
                ],
                data: {
                    testProp: 'a'
                }
            });

            expect(lockable.name).toBe('Test');
            expect(lockable.id).not.toBeUndefined();
            expect(lockable.data.testProp).toBe('a');

            await lockableService.delete('name', lockable.name);
        });
    });

    describe('#retrieve', () => {
        it('Should retrieve the lockable named \'Test\'.', async () => {
            const lockableService = container.get<LockableService>(TYPES.LockableService);

            await lockableService.create({
                name: 'Test',
                categories: [],
                data: { },
                createdOn: new Date()
            });
            let lockable: Lockable|undefined;

            try {
                lockable = await lockableService.retrieve('name', 'Test');
            } catch { }

            let otherLockable: Lockable|undefined;
            try {
                otherLockable = await lockableService.retrieve('id', lockable.id);
            } catch { }

            expect(lockable).not.toBeUndefined();
            expect(lockable.name).toBe('Test');
            expect(lockable.id).not.toBeUndefined();

            expect(otherLockable).not.toBeUndefined();
            expect(otherLockable.name).toBe(lockable.name);
            expect(otherLockable.id).toBe(lockable.id);

            lockableService.delete('id', lockable.id);
        });
    });

    describe('#update', () => {
        it ('Should update the lockable named \'Test\' to be renamed \'TestV2\'.', async () => {
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);

            const newName = 'TestV3';
            await lockableService.create({
                name: 'Test',
                categories: [],
                data: { },
                createdOn: new Date()
            });

            const lockable = await lockableService.retrieve('name', 'Test');
            lockable.name = newName;
            const afterSaving = await lockableService.update(lockable);

            expect(afterSaving).not.toBeUndefined();
            expect(afterSaving.name).toBe(newName);
            expect(lockable.name).toBe(newName);

            await lockableService.delete('name', newName);
        });
    });

    describe('#delete', () => {
        it ('Should delete the lockable named \'TestV2\'.', async () => {
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);

            const lockable = await lockableService.create({
                name: 'uniqueName',
                categories: [],
                createdOn: new Date(),
                data: { }
            });
            const result = await lockableService.delete('id', lockable.id);

            expect(result).toBe(true);
        });
    });

    describe('#paginate', () => {
        it ('Should create five documents and paginate over them two at a time.', async () => {
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);

            const lockables: Lockable[] = [];

            // Create five lockables
            for (let i = 1; i <= 5; i++) {
                const name = 'TestV' + i;

                const lockable = await lockableService.create({
                    name: name,
                    categories: [ 'Test' ],
                    createdOn: new Date(),
                    data: { }
                });

                lockables.push(lockable);
            }

            let paginationResults = await lockableService.paginate({
                limit: 2
            });

            expect(paginationResults.results.length).toBe(2);
            expect(paginationResults.previous).toBeUndefined();
            expect(paginationResults.next).not.toBeUndefined();

            paginationResults = await lockableService
                .paginate(paginationResults.next);

            expect(paginationResults.results.length).toBe(2);
            expect(paginationResults.previous).not.toBeUndefined();
            expect(paginationResults.next).not.toBeUndefined();

            paginationResults = await lockableService
                .paginate(paginationResults.previous);

            expect(paginationResults.results.length).toBe(2);
            expect(paginationResults.previous).toBeUndefined();
            expect(paginationResults.next).not.toBeUndefined();

            // Delete the five lockables.
            lockables.map(async lockable => {
                await lockableService.delete('id', lockable.id);
            });
        });
    });

    describe('#lock', () => {
        const lockables = [];

        afterEach(generateAfterEach(lockables));

        it ('Should create a lock.', async () => {
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);

            // Create five lockables.
            const newLockables = await generateLockables(5, lockableService);
            newLockables.map(lockable => lockables.push(lockable));

            // TODO: Finish test.
        });
    });

    describe('#retrieveLatestInCategory', () => {
        const lockables = [];

        afterEach(async () => {
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);

            while (lockables.length > 0) {
                const lockable = lockables.pop();
                await lockableService.delete('id', lockable.id);
            }
        });

        it ('Should retrieve the lockable named \'TestV3\'.', async () => {
            const lockableService = container
                .get<LockableService>(TYPES.LockableService);

            // Create three lockables
            for (let i = 1; i < 4; i++) {
                const name = `TestV${i}`;
                const lockable = await lockableService.create({
                    name: name,
                    categories: [
                        'purple',
                        'blue'
                    ],
                    createdOn: new Date(),
                    data: { }
                });

                lockables.push(lockable);
            }

            let now = new Date();
            let later = new Date();
            later.setHours(later.getHours() + 1);

            const sharedLock = new LockModel({
                lockedAt: now,
                isShared: true,
                maxLeaseDate: later
            }).toObject();

            lockables[2].locks.push(sharedLock);
            await lockableService.update(lockables[2]);

            now = new Date();
            later = new Date();
            later.setHours(later.getHours() + 1);

            const notSharedLock = new LockModel({
                lockedAt: now,
                isShared: false,
                maxLeaseDate: later
            }).toObject();

            lockables[1].locks.push(notSharedLock);
            await lockableService.update(lockables[1]);

            const latest = await lockableService
                .retrieveLatestInCategory(['purple']);
            // const latestShareble = await lockableService
            //     .retrieveLatestInCategory(['purple'], true);
            // const latestLockable = await lockableService
            //     .retrieveLatestInCategory(['purple'], undefined, false);

            expect(latest.name).toBe('TestV3');
            // expect(latestShareble.name).toBe('TestV3');
            // expect(latestLockable.name).toBe('TestV1');
        });
    });
});