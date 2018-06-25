import { inject, injectable } from 'inversify';

import { TYPES } from '../dependency-registrar';
import { CategoryLockableMap, GenericCategoryLockableMapData } from '../models/category-lockable-map';
import { Database } from '../models/database';
import { NotImplementedError, MessageError } from '../models/errors';
import { Paginate, PaginationResults } from '../models/paginate';
import { CategoryLockableMapService } from './category-lockable-map-service';
import { CollectionReference } from '@google-cloud/firestore';
import { CacheService } from './cache-service';

@injectable()
export class FirestoreCategoryLockableMapService implements CategoryLockableMapService {
    //#region Fields

    private readonly categoryLockableMapDb: CollectionReference;

    //#endregion

    //#region Constructor

    public constructor(@inject(TYPES.Database) private readonly database: Database,
        @inject(TYPES.StaticCache) private readonly cache: CacheService
    ) {
        this.categoryLockableMapDb = database.collection('category-lockable-map');
    }

    //#endregion

    //#region Functions

    public create(categoryLockableMap: GenericCategoryLockableMapData): Promise<CategoryLockableMap> {
        const self = this;
        return new Promise<CategoryLockableMap>(function(resolve, reject) {
            self.categoryLockableMapDb.add(categoryLockableMap)
            .then(result => {
                const catLockMap = new CategoryLockableMap({
                    id: result.id,
                    lockableRef: categoryLockableMap.lockableRef,
                    categoryRef: categoryLockableMap.category
                });

                resolve(catLockMap);
            })
            .catch(e => reject(e));
        });
    }

    public retrieve<U extends keyof CategoryLockableMap>(fieldName: U, value: CategoryLockableMap[U]): Promise<CategoryLockableMap> {
        const self = this;
        return new Promise<CategoryLockableMap>(function(resolve, reject) {
            if (fieldName === 'id') {
                self.categoryLockableMapDb.doc(<string>value)
                    .get()
                    .then(doc => {
                        const { lockableRef, categoryRef } = doc.data();
                        const catLockMap = new CategoryLockableMap({
                            id: doc.id,
                            categoryRef: categoryRef,
                            lockableRef: lockableRef
                        });

                        resolve(catLockMap);
                    })
                    .catch(e => reject(e));
            } else {
                reject(new NotImplementedError());
            }
        });
    }

    public update(categoryLockableMap: CategoryLockableMap): Promise<CategoryLockableMap> {
        const self = this;
        return new Promise<CategoryLockableMap>(function(resolve, reject) {
            self.categoryLockableMapDb.doc(categoryLockableMap.id)
                .update(categoryLockableMap.toFirestoreDataObject().data)
                .then(() => resolve(categoryLockableMap))
                .catch(e => reject(e));
        });
    }

    public delete<U extends keyof CategoryLockableMap>(fieldName: U, value: CategoryLockableMap[U]): Promise<boolean> {
        const self = this;
        return new Promise<boolean>(function(resolve, reject) {
            if (fieldName === 'id') {
                self.categoryLockableMapDb.doc(<string>value)
                    .delete()
                    .then(() => resolve(true))
                    .catch(e => reject(e));
            } else {
                reject(new NotImplementedError());
            }
        });
    }

    public paginate(paginate: Paginate<CategoryLockableMap>): Promise<PaginationResults<CategoryLockableMap>> {
        const self = this;
        return new Promise<PaginationResults<CategoryLockableMap>>(function(resolve, reject) {

            // Veryify arg.
            if (paginate.orderBy.length === 0) {
                reject(new MessageError('Argument paginate.orderBy must have at least one element.'));
            }

            let query = self.categoryLockableMapDb.limit(paginate.limit);

            // Apply orderBy(s).
            paginate.orderBy.map(orderBy => {
                query = query.orderBy(orderBy.fieldPath, orderBy.directionStr);
            });

            // Apply filters.
            if (paginate.filters !== undefined) {
                paginate.filters.map(filter => {
                    const { field, comparator, value } = filter;
                    query = query.where(field, comparator, value);
                });
            }

            if (paginate.startAfter !== undefined) {
                const firstOrderBy = paginate.orderBy[0];
                if (firstOrderBy.fieldPath === 'id') {
                    query = query.startAfter(paginate.startAfter.id);
                }
            }

            if (paginate.endAt !== undefined) {
                const firstOrderBy = paginate.orderBy[0];
                if (firstOrderBy.fieldPath === 'id') {
                    query = query.endAt(paginate.endAt.id);
                }
            }

            query.get()
                .then(result => {
                    const results = result.docs.map(doc => {
                        const {
                            id,
                            categoryRef,
                            lockableRef
                        } = doc.data();

                        return new CategoryLockableMap({
                            id,
                            categoryRef,
                            lockableRef
                        });
                    });

                    resolve({
                        results: results,
                        next: {
                            startAfter: results.length > 0 ? results[results.length - 1] : undefined,
                            limit: paginate.limit,
                            filters: paginate.filters,
                            orderBy: paginate.orderBy
                        },
                        previous: {
                            endAt: results.length > 0 ? results[0] : undefined,
                            limit: paginate.limit,
                            filters: paginate.filters,
                            orderBy: paginate.orderBy
                        }
                    });
                })
                .catch(e => reject(e));
        });
    }

    //#endregion
}