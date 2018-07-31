import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//#region Setup connection

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'libraryapi';
mongoose.connect(`${url}/${dbName}`, { useNewUrlParser: true })
    .then(() => console.log('Successfully connected to mongodb.'))
    .catch(error => console.error(error));

//#endregion

//#region Init schemas

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