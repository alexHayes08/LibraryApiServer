import { TYPES } from '../dependency-registrar';
import { inject } from 'inversify';
import { Database } from '../models/database';

/**
 * This will most likely be deleted.
 * This class will be responsible of abstracting the db interface away from
 * Firestore to be more platform agnostic.
 */
export class FirestoreService {
    //#region Fields

    //#endregion

    //#region Constructor

    constructor(@inject(TYPES.Database) private database: Database) {
        database.getCollections();
    }

    //#endregion

    //#region Properties

    //#endregion

    //#region Functions

    //#endregion
}