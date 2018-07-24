const mongoose = require('mongoose');

// import { Lock } from '../models/lock';

const url = 'mongodb://127.0.0.1:21017';
const dbName = 'libraryapi';
mongoose.connect(`${url}/${dbName}`)
    .then(() => console.log('Successfully connected to mongodb.'))
    .catch(error => console.error(error));

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//#region Init schemas

const LockSchema = new Schema({
    id: ObjectId,
    lockedAt: {
        type: Date,
        required: true
    },
    unlockedAt: {
        type: Date,
        default: null
    },
    isShared: { type: Boolean, default: false },
    maxLeaseDate: {
        type: Date,
        default: function() {
            const now = new Date();
            now.setHours(now.getHours() + 1);
            return now;
        }
    }
});

const LockModel = mongoose.model('Lock', LockSchema);

const LockableSchema = new Schema({
    id: ObjectId,
    ownerToken: String,
    name: String,
    categories: {
        type: [String],
        index: true
    },
    createdOn: Date,
    locks: [LockSchema]
});

LockableSchema.methods.getActiveLocks = function() {
    return this.locks.filter(lock => lock.unlockedAt < Date.now())
};

LockableSchema.methods.isLocked = function() {
    return this.getActiveLocks()
        .every(lock => lock.isShared === true);
};

LockableSchema.methods.isShared = function() {
    return this.getActiveLocks()
        .every(lock => lock.isShared === true);
};

const LockableModel = mongoose.model('Lockable', LockableSchema);

module.exports = {
    LockModel,
    LockableModel
}

//#endregion