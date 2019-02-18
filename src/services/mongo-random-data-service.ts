import { Document } from 'mongoose';

import { MongoCrudPlusPattern } from './mongo-crud-plus-pattern';
import { RandomData, GenericRandomData, GenericRandomDataItem, RandomDataItem } from '../models/random-data';
import { RandomDataService } from './random-data-service';
import { injectable } from 'inversify';
import { NotImplementedError } from '../models/errors';
import { PaginationResults, Paginate } from './../models/paginate';
import { RandomDataModel } from '../config/mongoose.config';

function documentToModel(doc: Document): RandomData {
    const data = doc.toObject({
        getters: true,
        virtuals: true
    });

    return new RandomData(data);
}

function documentToRandomDataItem(doc: Document): RandomDataItem {
    const data = doc.toObject({
        getters: true,
        virtuals: true
    });

    return new RandomDataItem(data);
}

@injectable()
export class MongoRandomDataService
        extends MongoCrudPlusPattern<RandomData, GenericRandomData>
        implements RandomDataService {

    public constructor() {
        super(RandomDataModel, documentToModel);
    }

    public getRandomRecord(groupName: string): Promise<GenericRandomDataItem> {
        const self = this;

        // Convert the group name to lower case.
        groupName = groupName.toLowerCase();

        return new Promise(function (resolve, reject) {
            RandomDataModel
                .findOneAndUpdate(
                    { group: groupName, 'items.usedRecently': false },
                    { '$set': { 'items.$.usedRecently': true }},
                    { fields: 'items.$.usedRecently' })
                .then(doc => {
                    if (doc === undefined || doc === null) {
                        reject(new Error('Failed to find the group.'));
                        return;
                    }

                    // The above query will only return the first item matching
                    // the query.
                    const item = doc['items'][0];
                    const model = documentToRandomDataItem(item);
                    resolve(model);

                    // If all of the items of that collection have been marked
                    // as used, unmark all of them.
                    self.assertCollectionHasUnusedItems(groupName);
                })
                .catch(error => reject(error));
        });
    }

    public create(data: GenericRandomData): Promise<RandomData> {

        // Convert the group name to lower case.
        data.group = data.group.toLowerCase();

        return super.create(data);
    }

    public createMany(models: RandomData[]): Promise<PaginationResults<RandomData>> {
        for (const m of models) {
            m.group = m.group.toLowerCase();
        }

        return super.createMany(models);
    }

    public retrieve<U extends keyof RandomData>(fieldName: U, value: RandomData[U]): Promise<RandomData> {
        if (fieldName === 'group') {
            value = value.toString().toLowerCase();
        }

        return super.retrieve(fieldName, value);
    }

    public update(data: RandomData): Promise<RandomData> {
        data.group = data.group.toLowerCase();

        return super.update(data);
    }

    public updateMany(data: RandomData[]): Promise<PaginationResults<RandomData>> {
        for (const d of data) {
            d.group = d.group.toLowerCase();
        }

        return super.updateMany(data);
    }

    public delete<V extends keyof RandomData>(fieldName: V, value: RandomData[V]): Promise<boolean> {
        if (fieldName === 'group') {
            value = value.toString().toLowerCase();
        }

        return super.delete(fieldName, value);
    }

    public deleteMany<V extends keyof RandomData>(fieldName: V, values: RandomData[V][]): Promise<boolean> {
        if (fieldName === 'group') {
            values = values.map(v => v.toString().toLowerCase());
        }

        return super.deleteMany(fieldName, values);
    }

    public createDataItem(groupName: string, model: GenericRandomDataItem): Promise<RandomDataItem> {

        // Convert the group name to lower case.
        groupName = groupName.toLowerCase();
        let idx = -1;

        return new Promise(function (resolve, reject) {
            RandomDataModel
                .findOne({ group: groupName })
                .then(doc => {
                    idx = doc['items'].push(model) - 1;

                    return doc.save();
                })
                .then(doc => {
                    const result = documentToRandomDataItem(doc['items'][idx]);

                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    public createManyDataItem(groupName: string, randomDataItem: GenericRandomDataItem[]): Promise<PaginationResults<RandomDataItem>> {

        // Verify there are items to create.
        if (randomDataItem.length === 0) {
            return Promise.resolve({ results: [] });
        }

        // Convert the group name to lower case.
        groupName = groupName.toLowerCase();
        let sliceIdx = -1;

        return new Promise(function (resolve, reject) {
            RandomDataModel
                .findOne({ group: groupName })
                .then(group => {
                    sliceIdx = group['items'].length;

                    for (const item of randomDataItem) {
                        group['items'].push(item);
                    }

                    return group.save();
                })
                .then(group => {
                    const createdItems = group.get('items')
                        .slice(sliceIdx)
                        .map(i => documentToModel(i));
                    const result = {
                        results: createdItems
                    };
                    resolve(result);
                });
        });
    }

    public retrieveDataItem<V extends keyof RandomDataItem>(field: V, fieldName: string, value: RandomDataItem[V]): Promise<RandomDataItem> {
        return new Promise(async function (resolve, reject) {
            const group = await RandomDataModel.findOne({ group: field });
            const items = group.get('items') as Document[];
            const item = items
                .map(i => documentToRandomDataItem(i))
                .find(i => i[fieldName] == value);

            if (item == undefined) {
                reject(new Error('No such item.'));
            } else {
                resolve(item);
            }
        });
    }

    public updateDataItem(groupName: string, model: RandomDataItem): Promise<RandomDataItem> {

        // Convert the group name to lower case.
        groupName = groupName.toLowerCase();

        return new Promise(async function (resolve, reject) {
            const group = await RandomDataModel.findOne({ group: groupName });
            const items = group.get('items') as object[];
            const idx = items
                .map(i => documentToRandomDataItem(i as Document))
                .findIndex(i => i.id === model.id);

            if (idx === -1) {
                reject('No such item.');
            }

            items[idx] = model;
            await group.save();

            resolve(model);
        });
    }

    public updateManyDataItem(groupName: string, models: RandomDataItem[]): Promise<PaginationResults<RandomDataItem>> {
        const self = this;

        // Convert the group name to lower case.
        groupName = groupName.toLowerCase();

        return new Promise(function (resolve, reject) {
            const items = [];

            Promise.all(models.map(m => {
                items.push(self.updateDataItem(groupName, m));
            }));

            resolve({
                results: items
            });
        });
    }

    public deleteDataItem<V extends keyof RandomDataItem>(groupName: string, fieldName: V, value: RandomDataItem[V]): Promise<boolean> {

        // Convert the group name to lower case.
        groupName = groupName.toLowerCase();

        return new Promise(async function (resolve, reject) {
            const group = await RandomDataModel.findOne({ group: groupName });

            if (group === undefined) {
                reject(new Error('No such group.'));
                return;
            }

            const items = group.get('items') as object[];

            reject(new NotImplementedError());
        });
    }

    public deleteManyDataItem<V extends keyof RandomDataItem>(groupName: string, fieldName: V, value: RandomDataItem[V]): Promise<boolean> {
        throw new NotImplementedError();
    }

    public paginateDataItem(groupName: string, data: Paginate<RandomDataItem>): Promise<PaginationResults<RandomDataItem>> {
        throw new NotImplementedError();
    }

    private assertCollectionHasUnusedItems(groupName: string): void {
        const self = this;

        self.hasUnusedItems(groupName)
            .then(result => {
                if (result) {
                    self.freeAllItems(groupName);
                }
            });
    }

    private hasUnusedItems(groupName: string): Promise<boolean> {
        return new Promise(function (resolve, reject) {
            RandomDataModel
                .findOne({ group: groupName, '': false })
                .then(doc => {
                    if (doc == undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                })
                .catch(error => reject(error));
        });
    }

    private freeAllItems(groupName: string): void {
        RandomDataModel
            .updateMany(
                { group: groupName },
                { '$set': { 'items.$.usedRecently': false }});
    }
}
