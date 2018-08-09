import { container, TYPES } from '../src/dependency-registrar';
import { LockService } from '../src/services/lock-service';
import { GenericLockData, GenericLockRecordData, Lock } from '../src/models/lock';
import { deleteItems, createItems } from '../src/helpers/test-helpers';

const lockService = container.get<LockService>(TYPES.LockService);
let items: Lock[] = [];

function itemGenerator(index: number): GenericLockRecordData {
    const lockedAt = new Date();
    const unlockedAt = new Date();
    const maxLeaseDate = new Date();

    lockedAt.setHours(lockedAt.getHours() - 8);
    unlockedAt.setHours(unlockedAt.getHours() - 7.5);
    maxLeaseDate.setHours(maxLeaseDate.getHours() - 7);

    return {
        ownerToken: '12345',
        lockableId: '54321',
        isShared: index % 0 === 0,
        lockedAt: lockedAt,
        unlockedAt: unlockedAt,
        maxLeaseDate: maxLeaseDate
    };
}

describe('LockService', () => {
    describe('#create', () => {
        afterEach(async () => {
            await deleteItems(items, lockService);
            items = [];
        });

        it ('Should create a Lock.', async () => {
            const lockStartDate = new Date();
            const lockEndDate = new Date();
            const maxLeaseDate = new Date();

            lockStartDate.setHours(lockStartDate.getHours() - 48);
            lockEndDate.setHours(lockEndDate.getHours() - 46);
            maxLeaseDate.setHours(lockEndDate.getHours() + .5);

            const lockData: GenericLockRecordData = {
                ownerToken: '12345',
                lockableId: '54321',
                isShared: true,
                lockedAt: lockStartDate,
                unlockedAt: lockEndDate,
                maxLeaseDate: maxLeaseDate
            };

            const lock = await lockService.create(lockData);
            items.push(lock);

            expect(lock).not.toBeUndefined();
            expect(lock.id).not.toBeUndefined();
        });
    });

    describe('#retrieve', () => {
        afterEach(async () => {
            await deleteItems(items, lockService);
        });

        it ('Should retrieve a lock.', async () => {

            // Create two items.
            items = await createItems(5, itemGenerator, lockService);

            const lock = await lockService.retrieve('lockedAt', items[0].lockedAt);

            expect(lock.id).not.toBeNull();
            expect(lock.lockedAt).toEqual(items[0].lockedAt);
        });
    });

    describe('#update', () => {
        afterEach(async () => await deleteItems(items, lockService));

        it ('Should update a lock.', async () => {

            // Create one item.
            items = await createItems(1, itemGenerator, lockService);

            const paginateResults = await lockService.paginate({ limit: 1 });

            const lock = items[0];
            const initialSharedState = lock.isShared;

            // Toggle & save isShared.
            lock.isShared = !lock.isShared;
            const afterSave = await lockService.update(lock);

            expect(afterSave.isShared).not.toBe(initialSharedState);
        });
    });

    describe('#delete', () => {
        afterEach(async () => await deleteItems(items, lockService));

        it ('Should delete a lock.', async () => {

            // Create one item.
            items = await createItems(1, itemGenerator, lockService);

            const result = await lockService.delete('id', items[0].id);

            expect(result).toBe(true);
        });
    });

    describe('#paginate', () => {
        afterEach(async () => await deleteItems(items, lockService));

        it ('Should paginate over five items.', async () => {

            // Create five items.
            items = await createItems(5, itemGenerator, lockService);

            let paginateResults = await lockService.paginate({ limit: 2 });

            expect(paginateResults.results.length).toBe(2);
            expect(paginateResults.next).not.toBeNull();
            expect(paginateResults.previous).toBeUndefined();

            paginateResults = await lockService.paginate(paginateResults.next);

            expect(paginateResults.results.length).toBe(2);
            expect(paginateResults.next).not.toBeUndefined();
            expect(paginateResults.previous).not.toBeUndefined();

            paginateResults = await lockService
                .paginate(paginateResults.previous);

            expect(paginateResults.results.length).toBe(2);
            expect(paginateResults.next).not.toBeNull();
            expect(paginateResults.previous).toBeUndefined();
        });
    });
});