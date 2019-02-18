import mongoose from 'mongoose';

import { Config } from './config';

const Schema = mongoose.Schema;

//#region Setup connection

const url = Config.databaseConnectionString;
const dbName = 'libraryapi';
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true })
    .then(() => console.log('Successfully connected to mongodb.'))
    .catch(error => console.error(error));

//#endregion

//#region Init schemas

//#region Lock

const LockSchema = new Schema({
    lockedAt: {
        type: Date,
        required: true
    },
    unlockedAt: {
        type: Date,
        default: undefined
    },
    isShared: {
        type: Boolean,
        default: false
    },
    maxLeaseDate: {
        type: Date,
        default: function() {
            const now = new Date();
            now.setHours(now.getHours() + 1);
            return now;
        }
    }
});

LockSchema.virtual('id').get(function () {
    return this['_id'].toString();
});

export const LockModel = mongoose.model('Lock', LockSchema);

//#endregion

//#region LockRecord

const LockRecordSchema = new Schema({
    lockableId: {
        type: String,
        required: true
    },
    lockedAt: {
        type: Date,
        required: true
    },
    unlockedAt: {
        type: Date,
        required: true
    },
    isShared: {
        type: Boolean,
        required: true
    },
    maxLeaseDate: {
        type: Date,
        required: true
    }
});

LockRecordSchema.virtual('id').get(function () {
    return this._id.toString();
});

export const LockRecordModel = mongoose.model('LockRecord', LockRecordSchema);

//#endregion

//#region Lockable

const LockableSchema = new Schema({
    ownerToken: String,
    name: String,
    categories: {
        type: [String],
        index: true
    },
    createdOn: Date,
    locks: [LockSchema],
    data: Object
});

LockableSchema.virtual('id').get(function () {
    return this._id.toString();
});

LockableSchema.methods.getActiveLocks = function() {
    return this.locks.filter(lock => lock.unlockedAt < Date.now());
};

LockableSchema.methods.isLocked = function() {
    return this.getActiveLocks()
        .every(lock => lock.isShared === true);
};

LockableSchema.methods.isShared = function() {
    return this.getActiveLocks()
        .every(lock => lock.isShared === true);
};

export const LockableModel = mongoose.model('Lockable', LockableSchema);

//#endregion

//#region CronJob

const CronJobSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    every: Schema.Types.Mixed,
    lastRun: Date,
    lastSuccessfulRun: Date
});

export const CronJobModel = mongoose.model('CronJob', CronJobSchema);

//#endregion

//#region RandomDataRecord

const RandomDataItemSchema = new Schema({
    usedRecently: {
        type: Boolean,
        required: true
    },
    data: Object
});

RandomDataItemSchema.virtual('id').get(function () {
    return this._id.toString();
});

const RandomDataSchema = new Schema({
    items: {
        type: [RandomDataItemSchema],
        required: true
    },
    group: {
        type: String,
        required: true
    }
});

RandomDataSchema.virtual('id').get(function () {
    return this._id.toString();
});

export const RandomDataModel = mongoose.model('RandomData', RandomDataSchema);
export const RandomDataItemModel = mongoose.model('RandomDataItem', RandomDataItemSchema);

//#endregion

//#endregion