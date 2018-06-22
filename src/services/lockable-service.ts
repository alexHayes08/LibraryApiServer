import { Lock } from '../models/lock';
import { GenericLockableData, Lockable, LockableData } from '../models/lockable';
import { CrudPlusPattern } from './crud-plus-pattern';

export interface LockableService extends CrudPlusPattern<Lockable, GenericLockableData, LockableData> {
    lock(lockable: Lockable, lock: Lock): void;
    unlock(lockable: Lockable, lock: Lock): void;
}