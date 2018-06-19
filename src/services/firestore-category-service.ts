import { injectable } from 'inversify';

import { Database } from '../models/database';
import { Category } from '../models/category';
import { CategoryService } from './category-service';
import { PaginationResults, Paginate } from '../models/paginate';
import { NotImplementedError } from '../models/errors';

/**
 * Short-hand name for categories.
 */
const CAT_COL_NAME = 'categories';
const categoriesDb = Database.collection(CAT_COL_NAME);

@injectable()
class FirestoreCategoryService implements CategoryService {
    public create(sitepool: Category|string, parentCategoryIds?: string[]): Promise<Category> {
        return new Promise<Category>(function(resolve, reject) {

            let query = categoriesDb;

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

                        // Update the stored object to contain the id prop.
                        doc.update(sp);

                        resolve(sp);
                    }).catch(e => reject(e));
            } else {
                query.doc(sitepool.id)
                    .set(sitepool)
                    .then(() => resolve(sitepool))
                    .catch(e => reject(e));
            }
        });
    }

    public retrieve<U extends keyof Category>(fieldName: U, value: Category[U]): Promise<Category> {
        return new Promise<Category>(function(resolve, reject) {

            if (fieldName == 'id') {
                categoriesDb.doc(<string>value)
                    .get()
                    .then(result => {

                        // Assert that result exists.
                        if (result == undefined) {
                            reject(new Error(`Failed to find a SitePool with an id of ${value}.`));
                            return;
                        }

                        const { id, name } = result.data();
                        const sp = new Category({ id, name });

                        resolve(sp);
                    });
            } else if (fieldName == 'name') {
                categoriesDb.where('name', '==', value)
                    .limit(1)
                    .get()
                    .then(result => {

                        // Check for any results
                        if (result.empty) {
                            reject(new Error(`Failed to find any SitePool with the name '${value}'.`));
                            return;
                        }

                        const { id, name } = result.docs[0].data();
                        const sp = new Category({ id, name });

                        resolve(sp);
                    }).catch(e => reject(e));
            } else {
                reject(new NotImplementedError());
            }
        });
    }

    public update(sitepool: Category): Promise<Category> {
        return new Promise<Category>(function(resolve, reject) {

            // Check if the id is set
            if (sitepool.id == undefined) {
                reject(new Error('The id cannot be null'));
                return;
            }

            categoriesDb.doc(sitepool.id)
                .update({ ...sitepool, id: undefined })
                .then(() => resolve(sitepool))
                .catch(e => reject(e));
        });
    }

    public delete<U extends keyof Category>(fieldName: U, value: Category[U]): Promise<boolean> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.retrieve(fieldName, value)
                .then(result => categoriesDb.doc(result.id).delete())
                .then(() => resolve(true))
                .catch(e => reject(e));
        });
    }

    public paginate(paginate: Paginate<Category>): Promise<PaginationResults<Category>> {

        // Validate args.
        if (paginate.orderBy.length == 0) {
            throw new Error('paginate.orderBy must have a length greater than zero.');
        }

        return new Promise<PaginationResults<Category>>(function(resolve, reject) {
            const { fieldPath: firstField,
                directionStr: firstDir
            } = paginate.orderBy[0];

            let query = categoriesDb.orderBy(firstField, firstDir).limit(paginate.limit);
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
            categoriesDb.doc(category.id)
                .get()
                .then(result => {
                    console.log(result);
                })
                .catch(e => reject(e));
        });
    }
}

export { FirestoreCategoryService };
