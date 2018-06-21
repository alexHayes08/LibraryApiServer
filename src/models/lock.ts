import { User } from './user';

export class LockInfo<T> {
    owner: T;
}

export class Lock {
    public readonly owner: User;
    public readonly isShared: boolean;
    public lockedAt?: Date;
    public unlockedAt?: Date;

    public constructor(owner: User, isShared: boolean = false) {
        this.owner = owner;
        this.isShared = isShared;
    }
}