import { CrudPlusPattern } from './crud-plus-pattern';
import { Lock, GenericLockRecordData } from '../models/lock';

/**
 * Active locks will be stored directly on the Lockable object. Once those
 * locks are deactivated they will be moved into their own table which is what
 * this service is for.
 */
export interface LockService extends CrudPlusPattern<Lock, GenericLockRecordData> { }