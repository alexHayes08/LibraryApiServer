export class LockInfo<T> {
    owner: T;
}

export class Lock<T> {
    public readonly owner: T;
    public readonly isShared: boolean;
    public lockedAt?: Date;
    public unlockedAt?: Date;

    public constructor(owner: T, isShared: boolean = false) {
        this.owner = owner;
        this.isShared = isShared;
    }
}