import 'reflect-metadata';

import {
    FirestoreData,
    index,
    subCollection,
    exclude
} from '../helpers/firestore-data-annotations';
import { Lock } from './lock';

export interface GenericLockableData {
    name: string;
    createdOn: Date;
    categories: string[];
    data: {
        [key: string]: any
    };
}

export interface LockableData extends GenericLockableData {
    id: string;
    locks: Lock[];
}

export class Lockable {
    //#region Fields

    public id: string;

    public locks: Lock[];
    public name: string;
    public createdOn: Date;
    public lastUsedOn: Date;
    public categories: string[];
    public data: {
        [key: string]: any
    };

    //#endregion

    //#region Constructor

    public constructor(data: LockableData) {
        this.id = data.id;
        this.locks = data.locks;
        this.name = data.name;
        this.data = data.data;
        this.createdOn = data.createdOn;
        this.categories = data.categories;
    }

    //#endregion

    //#region Functions

    public getActiveLocks(): Lock[] {
        return this.locks.filter(lock => lock.unlockedAt !== undefined
            || lock.unlockedAt < new Date());
    }

    public isLocked(): boolean {
        const activeLocks = this.getActiveLocks();
        return activeLocks.length > 0 && activeLocks.every(lock => {
            return lock.isShared === false;
        });
    }

    public isShared(): boolean {
        const activeLocks = this.getActiveLocks();
        return activeLocks.length > 0 && activeLocks.every(lock => {
            return lock.isShared === true;
        });
    }

    //#endregion
}

export function isGenericLockableData(value: any): value is GenericLockableData {
    return value !== undefined
        && value.id === undefined
        && value.name !== undefined
        && value.createdOn !== undefined
        && value.categories !== undefined;
}

export function isLockableData(value: any): value is LockableData {
    return value !== undefined
        && value.id !== undefined
        && value.name !== undefined
        && value.locks !== undefined
        && value.createdOn !== undefined
        && value.categories !== undefined;
}

export function isLockable(value: any): value is Lockable {
    return value !== undefined
        && value.isLocked !== undefined
        && value.isShared !== undefined
        && isLockableData(value);
}