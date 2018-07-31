import { injectable, inject } from 'inversify';
import { Document, Types } from 'mongoose';

import { LockableService } from './lockable-service';
import { LockableModel, LockModel } from '../config/mongoose.config';
import { Lockable, GenericLockableData } from '../models/lockable';
import { AlreadyLockedError } from '../models/errors';
import { GenericLockData, LockRecord, GenericLockRecordData, Lock } from '../models/lock';
import { MongoCrudPlusPattern } from './mongo-crud-plus-pattern';
import { TYPES } from '../dependency-registrar';
import { LockService } from './lock-service';

function documentToLockable(doc: Document): Lockable {
    const data = doc.toObject({
        getters: true,
        virtuals: true
    });

    return new Lockable(data);
}

@injectable()
export class MongoLockableService
        extends MongoCrudPlusPattern<Lockable, GenericLockableData>
        implements LockableService {
    //#region Fields

    private readonly lockService: LockService;

    //#endregion

    //#region Constructor

    public constructor(@inject(TYPES.LockService) lockService: LockService) {
        super(LockableModel, documentToLockable);
        this.lockService = lockService;
    }

    //#endregion

    //#region Functions

    public createMany(lockables: GenericLockableData[]): Promise<Lockable[]> {

        // Return an empty array if the arguments length is zero.
        if (lockables.length === 0) {
            return Promise.resolve([]);
        }

        const self = this;
        return new Promise(function(resolve, reject) {
            LockableModel.collection.insertMany(lockables)
                .then(async result => {
                    const ids: Types.ObjectId[] = [];

                    for (const idKey in result.insertedIds) {
                        ids.push(result.insertedIds[idKey]);
                    }

                    const docs = await LockableModel.find({
                        '_id': {
                            $in: ids
                        }
                    });

                    for (const doc of docs) {
                        doc.toObject();
                    }

                    const _lockables = docs.map(doc => doc.toObject({
                        virtuals: true,
                        getters: true
                    }));
                    resolve(_lockables);
                })
                .catch(error => reject(error));
        });
    }

    public lock(lockable: Lockable, lock: GenericLockData): Promise<Lockable> {
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

                    const _lockModel = new LockModel({
                        lockedAt: lock.lockedAt,
                        isShared: lock.isShared,
                        maxLeased: lock.maxLeaseDate,
                        ownerToken: lock.ownerToken
                    }).toObject({
                        virtuals: true,
                        getters: true
                    });

                    _lockable.locks.push(_lockModel);
                    self.update(_lockable)
                        .then(_lockable => resolve(_lockable));
                })
                .catch(error => reject(error));
        });
    }

    public unlock(lockable: Lockable, lockId: string): Promise<Lockable> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.retrieve('id', lockable.id)
                .then(_lockable => {
                    const _lock = _lockable.locks
                        .find(l => l.id === lockId);

                    // Assert lock isn't null.
                    if (_lock === undefined) {
                        reject(new Error('Failed to locate the lock.'));
                    }

                    const lockRecord: GenericLockRecordData = {
                        ownerToken: _lock.ownerToken,
                        lockableId: _lockable.id,
                        isShared: _lock.isShared,
                        lockedAt: _lock.lockedAt,
                        unlockedAt: new Date(),
                        maxLeaseDate: _lock.maxLeaseDate
                    };

                    // Remove lock from list of active locks.
                    _lockable.locks = _lockable.locks
                        .filter(l => l.id !== lockId);

                    // Save lock in seperate table. Don't need to await this.
                    self.lockService.create(lockRecord);

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

                    const lockable = documentToLockable(doc);
                    resolve(lockable);
                })
                .catch(error => reject(error));
        });
    }

    //#endregion
}