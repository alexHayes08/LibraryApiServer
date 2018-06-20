import admin from 'firebase-admin';
import * as serviceAccountInfo from '../config/Aperture-Test-Manager-V2-8e1d10e8342c.json';
import {
    CollectionReference,
    DocumentReference,
    DocumentSnapshot,
    Transaction,
    WriteBatch
} from '@google-cloud/firestore';

export const FSDatabase = admin.initializeApp({
    credential: admin.credential.cert(<any>serviceAccountInfo)
}).firestore();

export interface Database {
    collection(collectionPath: string): CollectionReference;
    doc(documentPath: string): DocumentReference;
    getAll(...documentRef: DocumentReference[]): Promise<DocumentSnapshot[]>;
    getCollections(): Promise<CollectionReference[]>;
    runTransaction<T>(
        updateFunction: (transaction: Transaction) => Promise<T>
    ): Promise<T>;
    batch(): WriteBatch;
}