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
                    doc.update(lockable);
                })
                .catch(error => reject(error));
        });
    }

    public delete<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<boolean> {
        return Promise.reject(new NotImplementedError());
    }

    public paginate(data: Paginate<Lockable>): Promise<PaginationResults<Lockable>> {
        return Promise.reject(new NotImplementedError());
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