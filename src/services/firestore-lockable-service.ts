import { CollectionReference } from '@google-cloud/firestore';
import { Database } from './../models/database';
import { NotImplementedError } from './../models/errors';
import { LockableService } from './lockable-service';
import { Lockable } from '../models/lockable';
import { Paginate, PaginationResults } from '../models/paginate';
import { inject } from 'inversify';
import { TYPES } from '../dependency-registrar';
import { convertToPOD } from '../helpers/firestore-data-annotations';

export class FirestoreLockableService implements LockableService {
    //#region Fields

    private readonly lockableDb: CollectionReference;

    //#endregion

    //#region Constructor

    public constructor(@inject(TYPES.Database) private database: Database) {
        this.lockableDb = database.collection('lockables');
    }

    //#endregion

    //#region Functions

    public create(lockable: Lockable|string): Promise<Lockable> {
        const self = this;
        return new Promise<Lockable>(function(resolve, reject) {
            if (typeof lockable === 'string') {
                self.lockableDb.add({ name: lockable })
                    .then(doc => {
                        const _lockable = new Lockable();

                        doc.update(convertToPOD(_lockable));
                        resolve(_lockable);
                    });
            } else {
                self.lockableDb.doc(lockable.id)
                    .set(convertToPOD(lockable))
                    .then(() => resolve(lockable))
                    .catch(e => reject(e));
            }
        });
    }

    public retrieve<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<Lockable> {
        return new Promise<Lockable>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    public update(lockable: Lockable): Promise<Lockable> {
        return new Promise<Lockable>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    public delete<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<boolean> {
        return new Promise<boolean>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    public paginate(paginate: Paginate<Lockable>): Promise<PaginationResults<Lockable>> {
        return new Promise<PaginationResults<Lockable>>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    public lock(lockable: Lockable): Promise<Lockable> {
        return new Promise<Lockable>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    public unlock(lockable: Lockable): Promise<Lockable> {
        return new Promise<Lockable>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    //#endregion
}