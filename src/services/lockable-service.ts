import { CrudPlusPattern } from './crud-plus-pattern';
import { Lockable, LockableData } from '../models/lockable';
import { Lock } from '../models/lock';

export interface LockableService extends CrudPlusPattern<Lockable> {
    create(lockable: Lockable|string): Promise<Lockable>;
    lock(lockable: Lockable, lock: Lock): void;
    unlock(lockable: Lockable, lock: Lock): void;
}