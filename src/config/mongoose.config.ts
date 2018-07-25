import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//#region Setup connection

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'libraryapi';
mongoose.connect(`${url}/${dbName}`)
    .then(() => console.log('Successfully connected to mongodb.'))
    .catch(error => console.error(error));

//#endregion

//#region Init schemas

const LockSchema = new Schema({
    id: ObjectId,
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

export const LockModel = mongoose.model('Lock', LockSchema);

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