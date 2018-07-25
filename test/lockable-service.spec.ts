import { container, TYPES } from '../src/dependency-registrar';
import { LockableService } from '../src/services/lockable-service';
import { Lockable } from '../src/models/lockable';

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
        });
    });

    describe('#retrieve', () => {
        it('Should retrieve the lockable named \'Test\'.', async () => {
            const lockableService = container.get<LockableService>(TYPES.LockableService);

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
        });
    });

    describe('#update', () => {
        it ('Should update the lockable named \'Test\' to be renamed \'TestV2\'.', async () => {
            const lockableService = container.get<LockableService>(TYPES.LockableService);
            const newName = 'TestV2';

            const lockable = await lockableService.retrieve('name', 'Test');
            lockable.name = newName;
            const afterSaving = await lockableService.update(lockable);

            expect(afterSaving).not.toBeUndefined();
            expect(afterSaving.name).toBe(newName);
            expect(lockable.name).toBe(newName);
        });
    });
});