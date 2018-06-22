import { container, TYPES } from '../src/dependency-registrar';
import { LockableService } from '../src/services/lockable-service';
import { Lockable } from '../src/models/lockable';

describe('lockable-service', () => {
    describe('#create', () => {
        it('Should create a new lockable named \'Test\'.', async () => {
            const lockableService =
                container.get<LockableService>(TYPES.LockableService);

            const lockable = await lockableService.create({
                name: 'Test',
                createdOn: new Date(),
                categories: [],
                data: {
                    testProp: 'a'
                }
            });

            expect(lockable.name).toBe('test');
        });
    });
});