import 'reflect-metadata';

import { inject, injectable } from 'inversify';

import { Category } from '../models/category';
import { CategoryService } from './category-service';
import { PaginationResults, Paginate } from '../models/paginate';
import { NotImplementedError } from '../models/errors';
import { TYPES } from '../dependency-registrar';
import { Database } from '../models/database';
import { CollectionReference } from '@google-cloud/firestore';

/**
 * Short-hand name for categories.
 */
const CAT_COL_NAME = 'categories';
// const categoriesDb = FSDatabase.collection(CAT_COL_NAME);

@injectable()
class FirestoreCategoryService implements CategoryService {
    //#region Fields

    private readonly categoriesDb: CollectionReference;

    //#endregion

    //#region Constructor

    public constructor(@inject(TYPES.Database) private database: Database) {
        this.categoriesDb = this.database.collection(CAT_COL_NAME);
    }

    //#endregion

    //#region Functions

    public create(sitepool: Category|string, parentCategoryIds?: string[]): Promise<Category> {
        const self = this;
        return new Promise<Category>(function(resolve, reject) {

            let query: CollectionReference = self.categoriesDb;

            if (parentCategoryIds != undefined && parentCategoryIds.length > 0) {
                parentCategoryIds.map(ex =>
                    query = query.doc(ex).collection(CAT_COL_NAME));
            }

            if (typeof sitepool == 'string') {

                // Do something
                query.add({ name: sitepool })
                    .then(doc => {

                        // Create new SitePool with the data
                        const sp = new Category({
                            name: sitepool,
                            id: doc.id
                        });

                        // Update the stored object.
                        doc.update(sp.toFirestoreDataObject());
                        resolve(sp);
                    }).catch(e => reject(e));
            } else {
                query.doc(sitepool.id)
                    .set(sitepool.toFirestoreDataObject())
                    .then(() => resolve(sitepool))
                    .catch(e => reject(e));
            }
        });
    }

    public retrieve<U extends keyof Category>(fieldName: U, value: Category[U]): Promise<Category> {
        const self = this;
        return new Promise<Category>(function(resolve, reject) {

            if (fieldName == 'id') {
                self.categoriesDb.doc(<string>value)
                    .get()
                    .then(result => {

                        // Assert that result exists.
                        if (result == undefined) {
                            reject(new Error(`Failed to find a SitePool with an id of ${value}.`));
                            return;
                        }

                        const { name } = result.data();
                        const sp = new Category({
                            id: result.id,
                            name,
                            parentCategoryIds: result.ref.path.split('/')
                                .slice(1)
                         });

                        resolve(sp);
                    });
            } else if (fieldName == 'name') {
                self.categoriesDb.where('name', '==', value)
                    .limit(1)
                    .get()
                    .then(result => {

                        // Check for any results
                        if (result.empty) {
                            reject(new Error(`Failed to find any SitePool with the name '${value}'.`));
                            return;
                        }

                        const doc = result.docs[0];
                        const { name } = doc.data();
                        const sp = new Category({
                            id: doc.id,
                            name: name,
                            parentCategoryIds: doc.ref.path.split('/').slice(1)
                        });

                        resolve(sp);
                    }).catch(e => reject(e));
            } else {
                reject(new NotImplementedError());
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

        // Validate args.
        if (paginate.orderBy.length == 0) {
            throw new Error('paginate.orderBy must have a length greater than zero.');
        }

        return new Promise<PaginationResults<Category>>(function(resolve, reject) {
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

            if (paginate.filter != undefined) {
                const { field, comparator, value } = paginate.filter;
                query = query.where(field, comparator, value);
            }

            query = query.limit(paginate.limit);

            query.get()
                .then(result => {

                    // Check if empty.
                    if (result.empty) {

                    }

                    result.docs.map(doc => {
                        const { id,
                            name,
                            parentCategoryId
                        } = doc.data();
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
