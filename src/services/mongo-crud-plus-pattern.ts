import { Document, Model, Types, Collection } from 'mongoose';

import { CrudPlusPattern } from './crud-plus-pattern';
import { Entity } from '../models/entity';
import { PaginationResults, Paginate, Filter } from '../models/paginate';
import { NotImplementedError } from '../models/errors';
import { injectable, unmanaged } from '../../node_modules/inversify';

@injectable()
export class MongoCrudPlusPattern<T extends Entity, U> implements CrudPlusPattern<T, U> {
    //#region Fields

    private readonly documentToModel: (doc: Document) => T;
    private readonly model: Model<Document>;

    //#endregion

    //#region Constructor

    public constructor(@unmanaged() model: Model<Document>,
            @unmanaged() documentToModel: (doc: Document) => T) {
        this.documentToModel = documentToModel;
        this.model = model;
    }

    //#endregion

    //#region Methods

    public create(data: U): Promise<T> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const model = new self.model(data);
            model.save()
                .then(doc => {
                    const asObj = self.documentToModel(doc);
                    resolve(asObj);
                })
                .catch(error => reject(error));
        });
    }

    public createMany(data: U[]): Promise<PaginationResults<T>> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const models = data.map(d => {
                return new self.model(d);
            });

            self.model.collection.insertMany(models)
                .then(result => {
                    const ids: string[] = [];

                    for (let i = 0; i < result.insertedCount; i++) {
                        const id = result.insertedIds[i].toHexString();
                        ids.push(id);
                    }

                    self.paginate({
                            limit: models.length,
                            filters: ids.map(id => <Filter<T>>{
                                field: 'id',
                                comparator: '==',
                                value: id
                            })
                        })
                    .then(paginationResults => resolve(paginationResults))
                    .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    public retrieve<V extends keyof T>(fieldName: V, value: T[V]): Promise<T> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const findResultCallback = function(doc?: Document) {
                if (doc === undefined) {
                    reject(new Error('Failed to find Lock.'));
                    return;
                }

                const lockRecord = self.documentToModel(doc);
                resolve(lockRecord);
            };

            switch (fieldName) {
                case 'id': {
                    self.model.findById(value)
                        .then(findResultCallback)
                        .catch(error => reject(error));
                    break;
                }

                default: {
                    const findData = {};
                    findData[<string>fieldName] = value;
                    self.model.findOne(findData)
                        .then(findResultCallback)
                        .catch(error => reject(error));
                    break;
                }
            }
        });
    }

    public update(data: T): Promise<T> {
        const self = this;
        return new Promise(function(resolve, reject) {
            self.model.findById(data.id)
                .then(doc => {
                    doc.update(data)
                        .then(res => resolve(data))
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    public updateMany(data: T[]): Promise<PaginationResults<T>> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const promises: Promise<undefined>[] = [];

            for (const item of data) {
                promises.push(new Promise((resolve, reject) => {
                    self.update(item)
                        .then(() => resolve(undefined))
                        .catch(error => reject(error));
                }));
            }

            Promise.all(promises)
                .then(() => {
                    self.paginate({
                            limit: data.length,
                            filters: data.map(d => <Filter<T>>{
                                field: 'id',
                                comparator: '==',
                                value: d.id
                            })
                        })
                        .then(paginationResults => resolve(paginationResults))
                        .catch(error => reject(error));
                })
                .catch(error => reject(error));
        });
    }

    public delete<V extends keyof T>(fieldName: V, value: T[V]): Promise<boolean> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const findData = { };
            if (fieldName === 'id') {
                findData['_id'] = Types.ObjectId(<any>value);
            } else {
                findData[<string>fieldName] = value;
            }
            self.model.deleteOne(findData)
                .then(res => resolve(res.n > 0))
                .catch(error => reject(error));
        });
    }

    public deleteMany<V extends keyof T>(fieldName: V, values: T[V][]): Promise<boolean> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const promises: Promise<undefined>[] = [];
            for (const value of values) {
                promises.push(new Promise((resolve, reject) => {
                    self.delete(fieldName, value)
                        .then(() => resolve())
                        .catch(error => reject(error));
                }));
            }

            Promise.all(promises)
                .then(() => resolve(true))
                .catch(error => reject(error));
        });
    }

    public paginate(data: Paginate<T>): Promise<PaginationResults<T>> {
        const self = this;
        return new Promise(function(resolve, reject) {
            const query = self.model.find();

            if (data.filters !== undefined) {
                data.filters.map(filter => {
                    query.where(filter.field);
                    switch (filter.comparator) {
                        case '<=':
                            query.gte(filter.value);
                            break;
                        case '<':
                            query.gt(filter.value);
                            break;
                        case '==':
                            query.equals(filter.value);
                            break;
                        case '>':
                            query.lt(filter.value);
                            break;
                        case '>=':
                            query.lte(filter.value);
                            break;
                        default:
                            if (filter.comparator in query) {
                                query[filter.comparator](filter.value);
                            } else {
                                reject(new NotImplementedError());
                                return;
                            }
                    }
                });
            }

            if (data.skip) {
                query.skip(data.skip);
            }

            if (data.orderBy === undefined) {
                query.sort({ createdOn: -1 });
            } else {
                const orderBy = { };
                data.orderBy.map(by => {
                    let direction = 1;

                    if (by.directionStr === 'desc') {
                        direction = -1;
                    }

                    orderBy[<string>by.fieldPath] = direction;
                });
                query.sort(orderBy);
            }

            query.limit(data.limit).then(docs => {
                const skipped = data.skip || 0;
                const results: T[] = docs.map(doc => {
                    return self.documentToModel(doc);
                });

                const paginationResults: PaginationResults<T> = {
                    results
                };

                // Check if there are 'previous' results.
                if (skipped > 0) {
                    const previous: Paginate<T> = {
                        orderBy: data.orderBy,
                        limit: data.limit,
                        filters: data.filters,
                    };

                    if (previous.limit > skipped) {
                        previous.limit = previous.limit - skipped;
                        previous.skip = 0;
                    } else {
                        previous.skip = skipped - data.limit;
                    }

                    paginationResults.previous = previous;
                }

                // Check if there are 'next' results.
                if (results.length === data.limit) {
                    const next: Paginate<T> = {
                        orderBy: data.orderBy,
                        limit: data.limit,
                        filters: data.filters,
                        skip: skipped + data.limit
                    };

                    paginationResults.next = next;
                }

                resolve(paginationResults);
            })
            .catch(error => reject(error));
        });
    }

    //#endregion
}