import { injectable } from 'inversify';
import { Document, Types } from 'mongoose';

import { LockableService } from './lockable-service';
import { LockableModel, LockModel } from '../config/mongoose.config';
import { Lockable, GenericLockableData } from '../models/lockable';
import { NotImplementedError, AlreadyLockedError } from '../models/errors';
import { Lock } from '../models/lock';
import { PaginationResults, Paginate } from '../models/paginate';
import { rejects } from 'assert';

@injectable()
export class MongoLockableService implements LockableService {
    //#region Fields

    //#endregion

    //#region Constructor

    public constructor() { }

    //#endregion

    //#region Properties

    //#endregion

    //#region Functions

    private modelToLockable(model: Document): Lockable {
        const data = model.toObject({
            getters: true,
            virtuals: true
        });

        return new Lockable(data);
    }

    public create(lockableData: GenericLockableData): Promise<Lockable> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const model = new LockableModel(lockableData);
            model.save()
                .then(doc => {
                    const lockable = self.modelToLockable(doc);
                    resolve(lockable);
                })
                .catch(error => reject(error));
        });
    }

    public retrieve<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<Lockable> {
        const self = this;
        return new Promise(function(resolve, reject) {
            switch (fieldName) {
                case 'id': {
                    LockableModel.findById(value)
                        .then(doc => {
                            const lockable = self.modelToLockable(doc);
                            resolve(lockable);
                        })
                        .catch(error => reject(error));
                    break;
                }

                default: {
                    const findData = {};
                    findData[<string>fieldName] = value;
                    LockableModel.findOne(findData)
                        .then(doc => {
                            if (doc === undefined) {
                                throw new Error();
                            }

                            const lockable = self.modelToLockable(doc);
                            resolve(lockable);
                        })
                        .catch(error => reject(error));
                    break;
                }
            }
        });
    }

    public update(lockable: Lockable): Promise<Lockable> {
        return new Promise(function(resolve, reject) {
            LockableModel.findById(lockable.id)
                .then(doc => {
                    doc.update(lockable)
                        .then(res => resolve(lockable))
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    public delete<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            const findData = { };
            if (fieldName == 'id') {
                findData['_id'] = Types.ObjectId(<string>value);
            } else {
                findData[<string>fieldName] = value;
            }
            LockableModel.deleteOne(findData)
                .then(res => {
                    // tslint:disable-next-line:no-null-keyword
                    resolve(res.n > 0);
                })
                .catch(error => reject(error));
        });
    }

    public paginate(data: Paginate<Lockable>): Promise<PaginationResults<Lockable>> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const query = LockableModel.find();

            if (data.filters !== undefined) {
                data.filters.map(filter => {
                    switch (filter.comparator) {
                        case '<=':
                            query.gte(filter.value);
                            break;
                        case '<':
                            query.gt(filter.value);
                            break;
                        case '==':
                            query.equals(filter.value);
                            break;
                        case '>':
                            query.lt(filter.value);
                            break;
                        case '>=':
                            query.lte(filter.value);
                            break;
                        default:
                            reject(new NotImplementedError());
                            return;
                    }
                });
            }

            if (data.skip) {
                query.skip(data.skip);
            }

            if (data.orderBy === undefined) {
                query.sort({ createdOn: -1 });
            } else {
                const orderBy = { };
                data.orderBy.map(by => {
                    let direction = 1;

                    if (by.directionStr === 'desc') {
                        direction = -1;
                    }

                    orderBy[<string>by.fieldPath] = direction;
                });
                query.sort(orderBy);
            }

            query.limit(data.limit).then(docs => {
                const skipped = data.skip || 0;
                const results: Lockable[] = docs.map(doc => {
                    return self.modelToLockable(doc);
                });

                const paginationResults: PaginationResults<Lockable> = {
                    results
                };

                // Check if there are 'previous' results.
                if (skipped > 0) {
                    const previous: Paginate<Lockable> = {
                        orderBy: data.orderBy,
                        limit: data.limit,
                        filters: data.filters,
                    };

                    if (previous.limit > skipped) {
                        previous.limit = previous.limit - skipped;
                        previous.skip = 0;
                    } else {
                        previous.skip = skipped - data.limit;
                    }

                    paginationResults.previous = previous;
                }

                // Check if there are 'next' results.
                if (results.length === data.limit) {
                    const next: Paginate<Lockable> = {
                        orderBy: data.orderBy,
                        limit: data.limit,
                        filters: data.filters,
                        skip: skipped + data.limit
                    };

                    paginationResults.next = next;
                }

                resolve(paginationResults);
            })
            .catch(error => reject(error));
        });
    }

    public lock(lockable: Lockable, lock: Lock): Promise<Lockable> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.retrieve('id', lockable.id)
                .then(_lockable => {

                    // Verify the lockable isn't locked.
                    if (_lockable.isLocked()) {
                        reject(new AlreadyLockedError());
                    }

                    // Verify the lockable has no active locks on it if the
                    // lock isn't shared.
                    if (!lock.isShared && _lockable.isShared()) {
                        reject(new AlreadyLockedError());
                    }

                    _lockable.locks.push(lock);
                    self.update(_lockable);
                })
                .catch(error => reject(error));
        });
    }

    public unlock(lockable: Lockable, lockId: string): Promise<Lockable> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.retrieve('id', lockable.id)
                .then(_lockable => {
                    const _lock = _lockable.locks.find(l => l.id == lockId);

                    // Assert lock isn't null.
                    if (_lock === undefined) {
                        reject(new Error('Failed to locate the lock.'));
                    }

                    _lock.unlockedAt = new Date();
                    self.update(_lockable)
                        .then(l => resolve(l))
                        .catch(error => reject(error));
                })
                .catch (error => reject(error));
        });
    }

    public retrieveLatestInCategory(categoryNames: string[],
            isShared?: boolean,
            isLocked?: boolean): Promise<Lockable> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const findModel = {
                categories: {
                    $all: categoryNames
                }
            };

            if (isShared !== undefined) {
                findModel['locks'] = {
                    $all: {
                        // tslint:disable-next-line:no-null-keyword
                        unlockedAt: null,
                        isShared: true
                    }
                };
            } else if (isLocked !== undefined) {
                findModel['locks'] = {
                    $all: {
                        // tslint:disable-next-line:no-null-keyword
                        unlockedAt: null
                    }
                };
            }

            LockableModel.findOne(findModel)
                .sort({ createdOn: -1 })
                .then(doc => {
                    // tslint:disable-next-line:no-null-keyword
                    if (doc == null) {
                        reject(new Error('Failed to find any lockables.'));
                        return;
                    }

                    const lockable = self.modelToLockable(doc);
                    resolve(lockable);
                })
                .catch(error => reject(error));
        });
    }

    //#endregion
}