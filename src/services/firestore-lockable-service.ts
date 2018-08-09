// import { CollectionReference } from '@google-cloud/firestore';
// import { Database } from './../models/database';
// import { NotImplementedError, MessageError, InternalError } from './../models/errors';
// import { LockableService } from './lockable-service';
// import { Lockable, GenericLockableData, isLockableData } from '../models/lockable';
// import { Paginate, PaginationResults } from '../models/paginate';
// import { inject, injectable } from 'inversify';
// import { TYPES } from '../dependency-registrar';
// import { Lock } from '../models/lock';
// import { CategoryLockableMapService } from './category-lockable-map-service';

// @injectable()
// export class FirestoreLockableService implements LockableService {
//     //#region Fields

//     private readonly lockableDb: CollectionReference;

//     //#endregion

//     //#region Constructor

//     public constructor(@inject(TYPES.Database) private readonly database: Database,
//         @inject(TYPES.CategoryLockableMapService) private readonly categoryLockableMapService: CategoryLockableMapService
//     ) {
//         this.lockableDb = this.database.collection('lockables');
//     }

//     //#endregion

//     //#region Functions

//     public create(lockable: Lockable|GenericLockableData|string): Promise<Lockable> {
//         const self = this;
//         return new Promise<Lockable>(function(resolve, reject) {
//             if (typeof lockable === 'string') {
//                 self.lockableDb.add({ name: lockable })
//                     .then(doc => {
//                         const _lockable = new Lockable({
//                             id: doc.id,
//                             name: lockable,
//                             createdOn: new Date(),
//                             categories: [],
//                             locks: [],
//                             data: undefined
//                         });

//                         doc.update(_lockable.toFirestoreDataObject().data);
//                         resolve(_lockable);
//                     })
//                     .catch(e => reject(e));
//             } else if (isLockableData(lockable)) {
//                 self.lockableDb.doc(lockable.id)
//                     .set(lockable.toFirestoreDataObject())
//                     .then(result => {

//                         // Create each category async
//                         for (const category of lockable.categories) {

//                             // Don't await this, let it run async
//                             self.categoryLockableMapService.create({
//                                 category: category,
//                                 lockableRef: self.lockableDb.doc(lockable.id)
//                             });
//                         }

//                         resolve(lockable);
//                     })
//                     .catch(e => reject(e));
//             } else {
//                 self.lockableDb.add({
//                     name: lockable.name,
//                     locks: [],
//                     createdOn: lockable.createdOn
//                 })
//                 .then(doc => {

//                     // Create each category async
//                     for (const category of lockable.categories) {

//                         // Don't await this, let it run async
//                         self.categoryLockableMapService.create({
//                             category: category,
//                             lockableRef: doc
//                         });
//                     }

//                     const _lockable = new Lockable({
//                         id: doc.id,
//                         name: lockable.name,
//                         createdOn: lockable.createdOn,
//                         categories: lockable.categories,
//                         locks: [],
//                         data: lockable.data
//                     });

//                     resolve(_lockable);
//                 })
//                 .catch(e => reject(e));
//             }
//         });
//     }

//     public retrieve<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<Lockable> {
//         const self = this;
//         return new Promise<Lockable>(function(resolve, reject) {
//             if (fieldName === 'id') {
//                 self.lockableDb.doc(fieldName)
//                     .get()
//                     .then(doc => {
//                         const { createdOn, name, data } = doc.data();
//                         doc.ref.collection('locks')
//                             .get()
//                             .then(async result => {
//                                 const locks = result.docs.map(_doc => {
//                                     const { ownerId, isShared } = _doc.data();
//                                     return new Lock(ownerId, isShared);
//                                 });

//                                 const categories = await self.categoryLockableMapService.paginate({
//                                     limit: 10,
//                                     filters: [{
//                                         field: 'lockableRef',
//                                         comparator: '==',
//                                         value: doc.ref
//                                     }]
//                                 });

//                                 const lockable = new Lockable({
//                                     id: doc.id,
//                                     name: name,
//                                     createdOn: createdOn,
//                                     locks: locks,
//                                     categories: categories.results.map(catLockMap => catLockMap.category),
//                                     data: data
//                                 });
//                                 resolve(lockable);
//                             })
//                             .catch(e => reject(e));
//                     })
//                     .catch(e => reject(e));
//             } else if (fieldName === 'name') {
//                 self.lockableDb.where('name', '==', value)
//                     .limit(1)
//                     .get()
//                     .then(result => {

//                         // Check if lockable was found.
//                         if (result.empty) {
//                             reject(new Error(`Failed to find lockable with name ${value}`));
//                         }

//                         const doc = result.docs[0];
//                         const { createdOn, name, data } = doc.data();
//                         doc.ref.collection('locks')
//                             .get()
//                             .then(async result => {
//                                 let locks: Lock[] = [];

//                                 if (!result.empty) {
//                                     locks = result.docs.map(_doc => {
//                                         const { ownerId, isShared } = _doc.data();
//                                         return new Lock(ownerId, isShared);
//                                     });
//                                 }

//                                 const categories = await self.categoryLockableMapService.paginate({
//                                     limit: 10,
//                                     filters: [{
//                                         field: 'lockableRef',
//                                         comparator: '==',
//                                         value: doc.ref
//                                     }]
//                                 });

//                                 const lockable = new Lockable({
//                                     id: doc.id,
//                                     name: name,
//                                     createdOn: createdOn,
//                                     locks: locks,
//                                     categories: categories.results.map(catLockMap => catLockMap.category),
//                                     data: data
//                                 });
//                                 resolve(lockable);
//                             })
//                             .catch(e => reject(e));
//                     })
//                     .catch(e => reject(e));
//             } else {
//                 reject(new NotImplementedError());
//             }
//         });
//     }

//     public retrieveLatestInCategory(categoryName: string,
//         isShared?: boolean,
//         isLocked?: boolean
//     ): Promise<Lockable> {
//         const self = this;
//         return new Promise<Lockable>(function(resolve, reject) {
//             self.categoryLockableMapService
//                 .paginate({
//                     limit: 1,
//                     filters: [{
//                         field: 'category',
//                         comparator: '==',
//                         value: categoryName
//                     }]
//                 })
//                 .then(async paginationResult => {

//                     // Return if no results were found.
//                     if (paginationResult.results.length == 0) {
//                         reject(new MessageError('No results found.'));
//                         return;
//                     }

//                     let lockableRef: Lockable;
//                     do {
//                         const lockCatRef = paginationResult.results[0];
//                         const result = await lockCatRef.lockableRef.get();

//                         if (!result.exists) {
//                             continue;
//                         }

//                         const locksRef = await result.ref.collection('locks').get();
//                         const locks = locksRef.docs.map(doc => {
//                             const { ownerToken, isShared } = doc.data();
//                             const id = doc.id;
//                             return new Lock(ownerToken, isShared, id);
//                         });

//                         // Verify the lockable is available
//                         if (isShared === true && isLocked === false
//                             && locks.some(lock => lock.isShared === false
//                                 && lock.unlockedAt === undefined)
//                         ) {
//                             continue;
//                         }

//                         const { name, createdOn, data } = result.data();

//                         lockableRef = new Lockable({
//                             id: result.id,
//                             locks: locks,
//                             name: name,
//                             createdOn: createdOn,
//                             categories: [],
//                             data: data
//                         });
//                     } while (lockableRef == undefined);
//                 })
//                 .catch(e => reject(e));
//             reject(new NotImplementedError());
//         });
//     }

//     public update(lockable: Lockable): Promise<Lockable> {
//         const self = this;
//         return new Promise<Lockable>(function(resolve, reject) {
//             self.lockableDb.doc(lockable.id)
//                 .set(lockable.toFirestoreDataObject().data)
//                 .then(result => resolve(lockable))
//                 .catch(e => reject(e));
//         });
//     }

//     public delete<U extends keyof Lockable>(fieldName: U, value: Lockable[U]): Promise<boolean> {
//         const self = this;
//         return new Promise<boolean>(function(resolve, reject) {
//             if (fieldName === 'id') {
//                 self.lockableDb.doc(<string>value)
//                     .delete()
//                     .then(() => resolve(true))
//                     .catch(e => reject(e));
//             } else if (fieldName === 'name') {
//                 self.retrieve(fieldName, value)
//                     .then(lockable => self.lockableDb.doc(lockable.id).delete())
//                     .then(() => resolve(true))
//                     .catch(e => reject(e));
//             } else {
//                 reject(new NotImplementedError());
//             }
//         });
//     }

//     public paginate(paginate: Paginate<Lockable>): Promise<PaginationResults<Lockable>> {
//         const self = this;
//         return new Promise<PaginationResults<Lockable>>(function(resolve, reject) {
//             let query = self.lockableDb.limit(paginate.limit);

//             if (paginate.orderBy !== undefined) {
//                 paginate.orderBy.map(orderBy => {
//                     query = query.orderBy(orderBy.fieldPath, orderBy.directionStr);
//                 });
//             }

//             if (paginate.filters !== undefined) {
//                 paginate.filters.map(filter => {
//                     const { field, comparator, value } = filter;
//                     query = query.where(field, comparator, value);
//                 });
//             }

//             if (paginate.startAfter !== undefined) {
//                 const firstOrderBy = paginate.orderBy[0];
//                 switch (firstOrderBy.fieldPath) {
//                     case 'id':
//                         query = query.startAfter(paginate.startAfter.id);
//                         break;

//                     case 'name':
//                         query = query.startAfter(paginate.startAfter.name);
//                         break;

//                     case 'createdOn':
//                         query = query.startAfter(paginate.startAfter.createdOn);
//                         break;
//                 }
//             }

//             if (paginate.endAt !== undefined) {
//                 const firstOrderBy = paginate.orderBy[0];
//                 switch (firstOrderBy.fieldPath) {
//                     case 'id':
//                         query = query.startAfter(paginate.startAfter.id);
//                         break;

//                     case 'name':
//                         query = query.startAfter(paginate.startAfter.name);
//                         break;

//                     case 'createdOn':
//                         query = query.startAfter(paginate.startAfter.createdOn);
//                         break;
//                 }
//             }

//             query.get()
//                 .then(result => {
//                     const results = result.docs.map(doc => {
//                         const {
//                             name,
//                             createdOn,
//                             data
//                         } = doc.data();

//                         return new Lockable({
//                             id: doc.id,
//                             name: name,
//                             createdOn: createdOn,
//                             locks: [],
//                             categories: [],
//                             data: data
//                         });
//                     });

//                     resolve({
//                         results: results,
//                         next: {
//                             startAfter: results.length > 0 ? results[results.length - 1] : undefined,
//                             limit: paginate.limit,
//                             filters: paginate.filters,
//                             orderBy: paginate.orderBy
//                         },
//                         previous: {
//                             endAt: results.length > 0 ? results[0] : undefined,
//                             limit: paginate.limit,
//                             filters: paginate.filters,
//                             orderBy: paginate.orderBy
//                         }
//                     });
//                 });
//         });
//     }

//     public lock(lockable: Lockable, lock: Lock): Promise<Lockable> {
//         const self = this;
//         return new Promise<Lockable>(function(resolve, reject) {
//             self.lockableDb.doc(lockable.id)
//                 .collection('locks')
//                 .add(lock.toFirestoreDataObject().data)
//                 .then(result => {
//                     const _lock = new Lock(lock.ownerToken,
//                         lock.isShared,
//                         result.id);
//                     _lock.lockedAt = lock.lockedAt;
//                     _lock.unlockedAt = lock.unlockedAt;
//                     resolve(lockable);
//                 })
//                 .catch(e => reject(e));
//         });
//     }

//     public unlock(lockable: Lockable, lockId: string): Promise<Lockable> {
//         return new Promise<Lockable>(function(resolve, reject) {
//             reject(new NotImplementedError());
//         });
//     }

//     //#endregion
// }