import admin from 'firebase-admin';
import * as serviceAccountInfo from '../config/Aperture-Test-Manager-V2-8e1d10e8342c.json';

export const Database = admin.initializeApp({
    credential: admin.credential.cert(<any>serviceAccountInfo)
}).firestore();