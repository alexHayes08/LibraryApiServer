import { exclude, FirestoreData } from './../helpers/firestore-data-annotations';

export interface GenericLockData {
    ownerToken: string;
    isShared: boolean;
    lockedAt: Date;
    maxLeaseDate: Date;
}

export class Lock extends FirestoreData {

    @exclude()
    public readonly id: string|undefined;
    public readonly ownerToken: string;
    public readonly isShared: boolean;
    public lockedAt?: Date;
    public unlockedAt?: Date;
    public checkoutPeriod: number;

    public constructor(ownerToken: string,
        isShared: boolean = false,
        id?: string
    ) {
        super();
        this.ownerToken = ownerToken;
        this.isShared = isShared;
        this.id = id;
    }
}

export function isLock(value: any): value is Lock {
    return value !== undefined
        && value.ownerToken !== undefined
        && value.isShared !== undefined
        && value.lockedAt !== undefined
        && value.unlockedAt !== undefined
        && value.checkoutPeriod !== undefined;
}