import { injectable } from 'inversify';
import { Document } from 'mongoose';

import { LockService } from './lock-service';
import { LockRecordModel } from '../config/mongoose.config';
import { Lock, GenericLockRecordData, LockRecordData } from '../models/lock';
import { MongoCrudPlusPattern } from './mongo-crud-plus-pattern';

function modelToLock(model: Document): LockRecordData {
    const data = model.toObject({
        getters: true,
        virtuals: true
    });

    return {
        id: data.id,
        ownerToken: data.ownerToken,
        lockableId: data.lockableId,
        isShared: data.isShared,
        lockedAt: data.lockedAt,
        unlockedAt: data.unlockedAt,
        maxLeaseDate: data.maxLeaseDate
    };
}

@injectable()
export class MongoLockService
    extends MongoCrudPlusPattern<Lock, GenericLockRecordData>
    implements LockService {
    //#region Constructor

    public constructor() {
        super(LockRecordModel, modelToLock);
    }

    //#endregion
}