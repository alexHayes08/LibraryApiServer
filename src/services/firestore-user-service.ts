// import { inject } from 'inversify';

// import { TYPES } from '../dependency-registrar';
// import { Database } from '../models/database';
// import { NotImplementedError } from '../models/errors';
// import { Paginate, PaginationResults } from '../models/paginate';
// import { User, GenericUserData } from '../models/user';
// import { UserService } from './user-service';
// import { CollectionReference } from '@google-cloud/firestore';

// export class FirestoreUserService implements UserService {
//     //#region Fields

//     private readonly userDb: CollectionReference;

//     //#endregion

//     //#region Constructor

//     public constructor(@inject(TYPES.Database) private database: Database) {
//         this.userDb = this.database.collection('users');
//     }

//     //#endregion

//     //#region Functions

//     public create(user: User|GenericUserData): Promise<User> {
//         return new Promise<User>(function(resolve, reject) {
//             reject(new NotImplementedError());
//         });
//     }

//     public retrieve<U extends keyof User>(fieldName: U, value: User[U]): Promise<User> {
//         return new Promise<User>(function(resolve, reject) {
//             reject(new NotImplementedError());
//         });
//     }

//     public update(user: User): Promise<User> {
//         return new Promise<User>(function(resolve, reject) {
//             reject(new NotImplementedError());
//         });
//     }

//     public delete<U extends keyof User>(fieldName: U, value: User[U]): Promise<boolean> {
//         return new Promise<boolean>(function(resolve, reject) {
//             reject(new NotImplementedError());
//         });
//     }

//     public paginate(paginate: Paginate<User>): Promise<PaginationResults<User>> {
//         return new Promise<PaginationResults<User>>(function(resolve, reject) {
//             reject(new NotImplementedError());
//         });
//     }

//     //#endregion
// }