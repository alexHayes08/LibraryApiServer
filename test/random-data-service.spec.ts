import * as mongoose from 'mongoose';

import { container, TYPES } from '../src/dependency-registrar';
import { RandomDataService } from '../src/services/random-data-service';
import { RandomDataModel } from '../src/config/mongoose.config';
import { RandomData, RandomDataItem } from '../src/models/random-data';

const randomDataService = container.get<RandomDataService>(TYPES.RandomDataService);

function generateTestGroup(): Promise<null> {

    // Verify the Test group exists.
    return new Promise(async function (resolve, reject) {
        try {
            const result = await randomDataService.retrieve('group', 'test');
            console.log(result);
        } catch (e) {
            await randomDataService.create({ items: [], group: 'Test' });
        }

        resolve();
    });
}

async function generateItems(numberToGenerate: number): Promise<RandomDataItem[]> {
    const dataItems = [];

    for (let i = 0; i < numberToGenerate; i++) {
        const data = {
            data: 'Test-' + i,
            usedRecently: false
        };

        dataItems.push(data);
    }

    const items = await randomDataService.createManyDataItem('Test', dataItems);
    return items.results;
}

describe('random-data-service', () => {
    afterAll(async () => {
        try {
            await randomDataService.delete('group', 'Test');
        } catch (error) { }

        try {
            await new Promise(function (resolve, reject) {
                RandomDataModel
                    .find({ group: /test/i })
                    .remove()
                    .then(() => resolve());
            });
        } catch (error) { }

        try {
            await mongoose.connection.close();
        } catch (error) { }
    });

    describe('#getRandomRecord', () => {
        it('Should retrieve a random entry in the Test collection.', async () => {
            await generateTestGroup();
            await generateItems(10);

            const firstEntry = await randomDataService.getRandomRecord('Test');
            const secondEntry = await randomDataService.getRandomRecord('test');

            expect(firstEntry).not.toBeNull();
            expect(secondEntry).not.toBeNull();

            // Verify the data is different.
            expect(firstEntry.data).not.toBe(secondEntry.data);
        });
    });

    describe('#create', () => {
        it('Should create a new random data collection named Test.', async () => {
            const collection = await randomDataService.create({
                group: 'Test',
                items: [
                    { usedRecently: false, data: { name: 'Alex' } }
                ]
            });

            expect(collection).not.toBeNull();
            expect(collection.group).toBe('test');
            expect(collection.items.length).toBe(1);
        });
    });

    describe('#createMany', () => {
        it ('Should create several collections named Test1, Test2, and Test3.', async() => {
            const results = await randomDataService.createMany([
                { group: 'Test1', items: [] },
                { group: 'Test2', items: [] },
                { group: 'Test3', items: [] }
            ]);

            expect(results).not.toBeNull();
            expect(results.results.length).toBe(3);
        });
    });

    describe('#retrieve', () => {
        it ('Should retrieve the Test collection.', async () => {
            const result = await randomDataService.retrieve('group', 'Test');

            expect(result).not.toBeNull();
        });
    });

    describe('#delete', () => {
        it ('Should delete a collection named Test.', async () => {
            await generateTestGroup();

            const result = await randomDataService.delete('group', 'test');

            expect(result).toBe(true);
        });

        it ('Should delete a collection named Test (case-insensitive).', async () => {
            await generateTestGroup();

            const result = await randomDataService.delete('group', 'Test');

            expect(result).toBe(true);
        });
    });

    describe('#createDataItem', () => {
        it ('Should create a data item in the Test collection.', async () => {
            await generateTestGroup();

            const entry = await randomDataService.createDataItem(
                'Test',
                { usedRecently: false, data: { name: 'alex' }});

            expect(entry).not.toBeNull();
        });
    });
});
