import { UserData, User } from './user';

export class Lock {
    public readonly ownerId: string;
    public readonly isShared: boolean;
    public lockedAt?: Date;
    public unlockedAt?: Date;

    public constructor(ownerId: string, isShared: boolean = false) {
        this.ownerId = ownerId;
        this.isShared = isShared;
    }
}