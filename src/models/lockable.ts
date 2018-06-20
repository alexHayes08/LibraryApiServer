import { Lock } from './lock';
import 'reflect-metadata';

export class Lockable<T> {
    public name: string;
    public id: string;
    public locks: Lock<T>[];

    public constructor() {
        this.locks = [];
    }

    public isLocked(): boolean {
        const now = Date.now();
        return this.locks.every(lock => now < (lock.unlockedAt || now));
    }

    public isShared(): boolean {
        const now = Date.now();
        const activeLocks = this.locks.filter(
            lock => (lock.lockedAt != undefined)
                && now < (lock.unlockedAt || now));
        return activeLocks.every(lock => lock.isShared);
    }
}