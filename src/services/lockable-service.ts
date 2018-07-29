import { GenericLockData } from '../models/lock';
import { GenericLockableData, Lockable, LockableData } from '../models/lockable';
import { CrudPlusPattern } from './crud-plus-pattern';

export interface LockableService extends CrudPlusPattern<Lockable, GenericLockableData, LockableData> {
    retrieve<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<Lockable>;
    lock(lockable: Lockable, lock: GenericLockData): Promise<Lockable>;
    unlock(lockable: Lockable, lockId: string): Promise<Lockable>;
    retrieveLatestInCategory(categoryNames: string[],
        isShared?: boolean,
        isLocked?: boolean): Promise<Lockable>;
}
