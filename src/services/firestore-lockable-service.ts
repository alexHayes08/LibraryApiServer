import { CollectionReference } from '@google-cloud/firestore';
import { Database } from './../models/database';
import { NotImplementedError } from './../models/errors';
import { LockableService } from './lockable-service';
import { Lockable } from '../models/lockable';
import { Paginate, PaginationResults } from '../models/paginate';
import { inject, injectable } from 'inversify';
import { TYPES } from '../dependency-registrar';
import { Lock } from '../models/lock';

@injectable()
export class FirestoreLockableService implements LockableService {
    //#region Fields

    private readonly lockableDb: CollectionReference;

    //#endregion

    //#region Constructor

    public constructor(@inject(TYPES.Database) private database: Database) {
        this.lockableDb = this.database.collection('lockables');
    }

    //#endregion

    //#region Functions

    public create(lockable: Lockable|string): Promise<Lockable> {
        const self = this;
        return new Promise<Lockable>(function(resolve, reject) {
            if (typeof lockable === 'string') {
                self.lockableDb.add({ name: lockable })
                    .then(doc => {
                        const _lockable = new Lockable({
                            id: doc.id,
                            name: lockable,
                            createdOn: new Date(),
                            categoryIds: [],
                            locks: []
                        });

                        doc.update(_lockable.toFirestoreDataObject().data);
                        resolve(_lockable);
                    })
                    .catch(e => reject(e));
            } else {
                self.lockableDb.doc(lockable.id)
                    .set(lockable.toFirestoreDataObject())
                    .then(() => resolve(lockable))
                    .catch(e => reject(e));
            }
        });
    }

    public retrieve<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<Lockable> {
        const self = this;
        return new Promise<Lockable>(function(resolve, reject) {
            if (fieldName === 'id') {
                self.lockableDb.doc(fieldName)
                    .get()
                    .then(doc => {
                        const { createdOn, name, categoryIds } = doc.data();
                        doc.ref.collection('locks')
                            .get()
                            .then(result => {
                                const locks = result.docs.map(_doc => {
                                    const { ownerId, isShared } = _doc.data();
                                    return new Lock(ownerId, isShared);
                                });
                                const lockable = new Lockable({
                                    id: doc.id,
                                    name: name,
                                    createdOn: createdOn,
                                    locks: locks,
                                    categoryIds: categoryIds
                                });
                                resolve(lockable);
                            })
                            .catch(e => reject(e));
                    })
                    .catch(e => reject(e));
            } else if (fieldName === 'name') {
                self.lockableDb.where('name', '==', value)
                    .limit(1)
                    .get()
                    .then(result => {

                        // Check if lockable was found.
                        if (result.empty) {
                            reject(new Error(`Failed to find lockable with name ${value}`));
                        }

                        const doc = result.docs[0];
                        const { createdOn, name, categoryIds } = doc.data();
                        doc.ref.collection('locks')
                            .get()
                            .then(result => {
                                let locks: Lock[] = [];

                                if (!result.empty) {
                                    locks = result.docs.map(_doc => {
                                        const { ownerId, isShared } = _doc.data();
                                        return new Lock(ownerId, isShared);
                                    });
                                }

                                const lockable = new Lockable({
                                    id: doc.id,
                                    name: name,
                                    createdOn: createdOn,
                                    locks: locks,
                                    categoryIds: categoryIds
                                });
                                resolve(lockable);
                            })
                            .catch(e => reject(e));
                    })
                    .catch(e => reject(e));
            } else {
                reject(new NotImplementedError());
            }
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

    public lock(lockable: Lockable, lock: Lock): Promise<Lockable> {
        return new Promise<Lockable>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    public unlock(lockable: Lockable, lock: Lock): Promise<Lockable> {
        return new Promise<Lockable>(function(resolve, reject) {
            reject(new NotImplementedError());
        });
    }

    //#endregion
}