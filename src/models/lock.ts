export interface GenericLockData {
    ownerToken: string;
    isShared: boolean;
    lockedAt: Date;
    maxLeaseDate: Date;
}

export interface GenericLockRecordData extends GenericLockData {
    unlockedAt: Date;
    lockableId: string;
}

export interface LockRecordData extends GenericLockRecordData {
    id: string;
}

export class LockRecord implements LockRecordData {
    //#region Fields

    id: string;
    lockableId: string;
    ownerToken: string;
    isShared: boolean;
    lockedAt: Date;
    unlockedAt: Date;
    maxLeaseDate: Date;

    //#endregion

    //#region Constructor

    public constructor(data?: Lock|LockRecordData) {
        if (isLock(data)) {
            const lock = <Lock>data;
            this.id = lock.id;
            this.ownerToken = lock.ownerToken;
            this.isShared = lock.isShared;
            this.lockedAt = lock.lockedAt;
            this.unlockedAt = lock.unlockedAt;
            this.maxLeaseDate = lock.maxLeaseDate;
        } else if (isLockRecordData(data)) {
            const lockRecord = <LockRecordData>data;
            this.id = lockRecord.id;
            this.lockableId = lockRecord.lockableId;
            this.ownerToken = lockRecord.ownerToken;
            this.isShared = lockRecord.isShared;
            this.lockedAt = lockRecord.lockedAt;
            this.unlockedAt = lockRecord.unlockedAt;
            this.maxLeaseDate = lockRecord.maxLeaseDate;
        }
    }

    //#endregion
}

export class Lock implements GenericLockData {
    public id: string|undefined;
    public ownerToken: string;
    public isShared: boolean;
    public lockedAt: Date;
    public unlockedAt?: Date;
    public maxLeaseDate: Date;

    public constructor(data?: GenericLockData) {
        if (data !== undefined) {
            this.ownerToken = data.ownerToken;
            this.isShared = data.isShared;
            this.lockedAt = data.lockedAt;
            this.maxLeaseDate = data.maxLeaseDate;
        }
    }
}

export function isGenericLockData(value: any): value is GenericLockData {
    return value !== undefined
        && value.ownerToken !== undefined
        && value.isShared !== undefined
        && value.lockedAt !== undefined
        && value.maxLeaseDate !== undefined;
}

export function isLock(value: any): value is Lock {
    return value !== undefined
        && value.id !== undefined
        && value.ownerToken !== undefined
        && value.isShared !== undefined
        && value.lockedAt !== undefined
        && value.unlockedAt !== undefined
        && value.checkoutPeriod !== undefined;
}

export function isLockRecordData(value: any): value is LockRecordData {
    return value !== undefined
        && value.id !== undefined
        && value.lockableId !== undefined
        && value.ownerToken !== undefined
        && value.isShared !== undefined
        && value.lockedAt !== undefined
        && value.unlockedAt !== undefined
        && value.maxLeaseDate !== undefined;
}

export function isGenericLockRecord(value: any): value is GenericLockRecordData {
    return value !== undefined
        && value.lockableId !== undefined
        && value.ownerToken !== undefined
        && value.isShared !== undefined
        && value.lockedAt !== undefined
        && value.unlockedAt !== undefined
        && value.maxLeaseDate !== undefined;
}
