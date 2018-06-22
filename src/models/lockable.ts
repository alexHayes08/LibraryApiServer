import 'reflect-metadata';

import { DocumentReference } from '@google-cloud/firestore';

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

export class Lockable extends FirestoreData {
    //#region Fields

    @index()
    public id: string;

    @subCollection()
    public locks: Lock[];

    public name: string;
    public createdOn: Date;
    public lastUsedOn: Date;
    public data: {
        [key: string]: any
    };

    @exclude()
    public categories: string[];

    //#endregion

    //#region Constructor

    public constructor(data: LockableData) {
        super();
        this.id = data.id;
        this.locks = data.locks;
        this.name = data.name;
        this.data = data.data;
        this.createdOn = data.createdOn;
        this.categories = data.categories;
    }

    //#endregion

    //#region Functions

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
        && value.isLocked != undefined
        && value.isShared != undefined
        && isLockableData(value);
}