// FIXME: This file is probably going to be deleted.

import 'reflect-metadata';

import { inject, injectable } from 'inversify';

import { Category } from '../models/category';
import { CategoryService } from './category-service';
import { PaginationResults, Paginate } from '../models/paginate';
import { NotImplementedError } from '../models/errors';
import { TYPES } from '../dependency-registrar';
import { Database } from '../models/database';
import { CollectionReference, QueryDocumentSnapshot, DocumentReference } from '@google-cloud/firestore';
import { CacheService } from './cache-service';

/**
 * Short-hand name for categories.
 */
const CAT_COL_NAME = 'categories';

@injectable()
class FirestoreCategoryService implements CategoryService {
    //#region Fields

    private readonly categoriesDb: CollectionReference;

    //#endregion

    //#region Constructor

    public constructor(@inject(TYPES.Database) private readonly database: Database,
        @inject(TYPES.StaticCache) private readonly cache: CacheService
    ) {
        this.categoriesDb = this.database.collection(CAT_COL_NAME);
    }

    //#endregion

    //#region Functions

    public create(category: Category|string, parentCategoryNames?: string[]): Promise<Category> {
        const self = this;
        return new Promise<Category>(function(resolve, reject) {
            let key = 'create:' + parentCategoryNames.join('/');
            if (typeof category === 'string') {
                key += '/' + category;
            } else {
                key += '/' + category.name;
            }

            const newcategory = self.cache.get<Category>(key);

            if (newcategory !== undefined) {
                resolve(newcategory);
            } else {
                let query: CollectionReference = self.categoriesDb;

                if (parentCategoryNames != undefined && parentCategoryNames.length > 0) {

                    // Iterate over each parent category and assert it exists.
                    parentCategoryNames.map(async (parentName, index, arr) => {

                        // Need to create the parent categories if they don't exist.
                        const parentSearchResult = await query
                            .where('name', '==', parentName)
                            .limit(1)
                            .get();
                        let id: string;
                        if (parentSearchResult.empty) {

                            // Create parent category
                            const parentCat = await self.create(parentName,
                                arr.slice(0, index));
                            id = parentCat.id;
                        } else {
                            id = parentSearchResult.docs[0].ref.id;
                        }

                        query = query.doc(id).collection(CAT_COL_NAME);
                    });
                }

                if (typeof category == 'string') {

                    // Do something
                    query.add({ name: category })
                        .then(doc => {

                            // Create new SitePool with the data
                            const sp = new Category({
                                name: category,
                                id: doc.id,
                                path: doc.path
                            });

                            // Update the stored object.
                            self.cache.set<Category>(key, sp);
                            doc.update(sp.toFirestoreDataObject().data);
                            resolve(sp);
                        }).catch(e => reject(e));
                } else {
                    query.doc(category.id)
                        .set(category.toFirestoreDataObject())
                        .then(() => {

                            // Store created category in the cache.
                            self.cache.set(key, category);
                            resolve(category);
                        })
                        .catch(e => reject(e));
                }
            }
        });
    }

    public retrieve<U extends keyof Category>(fieldName: U, value: Category[U], parentCategoryNames?: string[]): Promise<Category> {
        const self = this;
        return new Promise<Category>(function(resolve, reject) {
            parentCategoryNames = parentCategoryNames || [];
            const key = 'retrieve:'
                + parentCategoryNames.join('/')
                + value;
            const cachedcategory = self.cache.get<Promise<Category>>(key);

            if (cachedcategory !== undefined) {
                resolve(cachedcategory);
            } else {
                let categoriesCollection = self.categoriesDb;
                parentCategoryNames.map(async (name, index, arr) => {
                    const result = await categoriesCollection
                        .where(fieldName, '==', value)
                        .limit(1)
                        .get();

                    if (result.empty) {

                        // Parent category doesn't exist, return error.
                        reject(new Error('Parent category doesn\' exist.'));
                        return;
                    } else {
                        categoriesCollection = result
                            .docs[0].ref.collection(CAT_COL_NAME);
                    }
                });

                if (fieldName == 'id') {
                    categoriesCollection.doc(<string>value)
                        .get()
                        .then(result => {

                            // Assert that result exists.
                            if (result == undefined) {
                                reject(`Failed to find a SitePool with an id of ${value}.`);
                                return;
                            }

                            const { name } = result.data();
                            const sp = new Category({
                                id: result.id,
                                name: name,
                                path: result.ref.path
                            });

                            self.cache.set(key, sp);
                            resolve(sp);
                        });
                } else if (fieldName == 'name') {
                    categoriesCollection.where('name', '==', value)
                        .limit(1)
                        .get()
                        .then(result => {

                            // Check for any results
                            if (result.empty) {
                                reject(`Failed to find any SitePool with the name '${value}'.`);
                                return;
                            }

                            const doc = result.docs[0];
                            const { name } = doc.data();
                            const sp = new Category({
                                id: doc.id,
                                name: name,
                                path: doc.ref.path
                            });

                            self.cache.set(key, sp);
                            resolve(sp);
                        }).catch(e => reject(e));
                } else {
                    reject(new NotImplementedError());
                }
            }
        });
    }

    public update(sitepool: Category): Promise<Category> {
        const self = this;
        return new Promise<Category>(function(resolve, reject) {

            // Check if the id is set
            if (sitepool.id == undefined) {
                reject(new Error('The id cannot be null'));
                return;
            }

            self.categoriesDb.doc(sitepool.id)
                .update({ ...sitepool, id: undefined })
                .then(() => resolve(sitepool))
                .catch(e => reject(e));
        });
    }

    public delete<U extends keyof Category>(fieldName: U, value: Category[U]): Promise<boolean> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.retrieve(fieldName, value)
                .then(result => self.categoriesDb.doc(result.id).delete())
                .then(() => resolve(true))
                .catch(e => reject(e));
        });
    }

    public paginate(paginate: Paginate<Category>): Promise<PaginationResults<Category>> {
        const self = this;
        return new Promise<PaginationResults<Category>>(function(resolve, reject) {

            // Validate args.
            if (paginate.orderBy.length == 0) {
                reject(new Error('paginate.orderBy must have a length greater than zero.'));
            }

            const { fieldPath: firstField,
                directionStr: firstDir
            } = paginate.orderBy[0];

            let query = self.categoriesDb
                .orderBy(firstField, firstDir)
                .limit(paginate.limit);

            for (let i = 1; i < paginate.orderBy.length; i++) {
                const {
                    fieldPath,
                    directionStr
                } = paginate.orderBy[i];
                query = query.orderBy(fieldPath, directionStr);
            }

            if (paginate.filter !== undefined) {
                const { field, comparator, value } = paginate.filter;
                query = query.where(field, comparator, value);
            }

            if (paginate.startAfter !== undefined) {
                const firstOrderBy = paginate.orderBy[0];
                if (firstOrderBy.fieldPath === 'id') {
                    query = query.startAt(paginate.startAfter.id);
                } else if (firstOrderBy.fieldPath === 'name') {
                    query = query.startAfter(paginate.startAfter.name);
                }
            }

            if (paginate.endAt !== undefined) {
                const firstOrderBy = paginate.orderBy[0];
                if (firstOrderBy.fieldPath === 'id') {
                    query = query.endBefore(paginate.startAfter.id);
                } else if (firstOrderBy.fieldPath === 'name') {
                    query = query.endBefore(paginate.startAfter.id);
                }
            }

            query = query.limit(paginate.limit);

            query.get()
                .then(result => {
                    const results = result.docs.map(doc => {
                        const {
                            id,
                            name,
                        } = doc.data();

                        return new Category({
                            id: id,
                            name: name,
                            path: doc.ref.path });
                    });

                    resolve({
                        results: results,
                        next: {
                            startAfter: results.length > 0 ? results[results.length - 1] : undefined,
                            limit: paginate.limit,
                            filter: paginate.filter,
                            orderBy: paginate.orderBy
                        },
                        previous: {
                            endAt: results.length > 0 ? results[0] : undefined,
                            limit: paginate.limit,
                            filter: paginate.filter,
                            orderBy: paginate.orderBy
                        }
                    });
                })
                .catch(e => reject(e));
        });
    }

    public getChildCategories(category: Category): Promise<Category[]> {
        const self = this;
        return new Promise<Category[]>(function(resolve, reject) {
            self.categoriesDb.doc(category.id)
                .get()
                .then(result => {
                    console.log(result);
                })
                .catch(e => reject(e));
        });
    }

    //#endregion
}

export { FirestoreCategoryService };
