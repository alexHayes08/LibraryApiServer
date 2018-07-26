import { injectable } from 'inversify';
import { Document } from 'mongoose';

import { LockableService } from './lockable-service';
import { LockableModel, LockModel } from '../config/mongoose.config';
import { Lockable, GenericLockableData } from '../models/lockable';
import { NotImplementedError } from '../models/errors';
import { Lock } from '../models/lock';
import { PaginationResults, Paginate } from '../models/paginate';

function modelToLockable(model: Document): Lockable {
    const data = model.toObject({
        getters: true,
        virtuals: true
    });

    return new Lockable(data);
}

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

    public create(lockableData: GenericLockableData): Promise<Lockable> {
        return new Promise(function(resolve, reject) {
            const model = new LockableModel(lockableData);
            model.save()
                .then(doc => {
                    const lockable = modelToLockable(doc);
                    resolve(lockable);
                })
                .catch(error => reject(error));
        });
    }

    public retrieve<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<Lockable> {
        return new Promise(function(resolve, reject) {
            switch (fieldName) {
                case 'id': {
                    LockableModel.findById(value)
                        .then(doc => {
                            const lockable = modelToLockable(doc);
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

                            const lockable = modelToLockable(doc);
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
            findData[<string>fieldName] = value;
            LockableModel.deleteOne(findData)
                // tslint:disable-next-line:no-null-keyword
                .then(res => resolve(res != null && res.isDeleted()))
                .catch(error => reject(error));
        });
    }

    public paginate(data: Paginate<Lockable>): Promise<PaginationResults<Lockable>> {
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
                query.sort('createdOn');
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
                    return modelToLockable(doc);
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

    public lock(lockable: Lockable, lock: Lock): void {
        throw new NotImplementedError();
    }

    public unlock(lockable: Lockable, lockId: string): void {
        throw new NotImplementedError();
    }

    public retrieveLatestInCategory(): Promise<Lockable> {
        return Promise.reject(new NotImplementedError());
    }

    //#endregion
}