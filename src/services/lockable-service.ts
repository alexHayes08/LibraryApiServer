import { CrudPlusPattern } from './crud-plus-pattern';
import { Lockable } from '../models/lockable';

export interface LockableService extends CrudPlusPattern<Lockable> {
    create(lockable: Lockable|string): Promise<Lockable>;
    lock(lockable: Lockable): void;
    unlock(lockable: Lockable): void;
}