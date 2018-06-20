// import { describe, expect, it } from 'jest';

import {
    convertToPOD,
    index,
    propertyName,
    exclude,
    ingoreExtraProperties
} from '../src/helpers/firestore-data-annotations';

class DemoClassA {

    @index()
    public id: string;

    public propertyA: string;

    @propertyName()
    public propertyB: string;

    @propertyName('propertyC_renamed')
    public propertyC: string;

    @exclude()
    public propertyD: string;

    public constructor() {
        this.id = 'test-id';
        this.propertyA = 'Test A';
        this.propertyB = 'Test B';
        this.propertyC = 'Test C';
        this.propertyD = 'Test D';
    }

    public funcA(): void {
        console.log('Called funcA.');
    }

    public funcB(): void {
        console.log('Called funcB.');
    }
}

@ingoreExtraProperties()
class DemoClassB {

    @index()
    public id: string;

    public propertyA: string;

    @propertyName()
    public propertyB: string;

    @propertyName('propertyC_renamed')
    public propertyC: string;

    @exclude()
    public propertyD: string;

    constructor() {
        this.id = 'test-id';
        this.propertyA = 'Test A';
        this.propertyB = 'Test B';
        this.propertyC = 'Test C';
        this.propertyD = 'Test D';
    }

    public funcA(): void {
        console.log('Called funcA.');
    }

    public funcB(): void {
        console.log('Called funcB.');
    }
}

describe('firestore-annotations', () => {
    describe('#ignoreExtraProperties', () => {
        it('Positive test.', () => {
            const demo = new DemoClassB();
            const pod = convertToPOD(demo);

            expect(pod.data['propertyA']).toBe(undefined);
            expect(demo.propertyA).not.toBe(undefined);

            for (const prop in pod) {
                const type = typeof pod[prop];
                expect(type).not.toBe('function');
            }
        });

        it('Negative test.', () => {
            const demo = new DemoClassA();
            const pod = convertToPOD(demo);

            expect(pod.data['propertyD']).toBe(undefined);
            expect(demo.propertyD).not.toBe(undefined);

            for (const prop in pod) {
                const type = typeof pod[prop];
                expect(type).not.toBe('function');
            }
        });
    });

    describe('#index', () => {
        it('Should set the id to test-id.', () => {
            const demo = new DemoClassA();
            const pod = convertToPOD(demo);

            expect(pod.id).toBe(demo.id);
        });
    });

    describe('#exclude', () => {
        it('Should not include the property propertyD.', () => {
            const demo = new DemoClassA();
            const pod = convertToPOD(demo);

            expect(pod['propertyD']).toBe(undefined);
        });
    });

    describe('#propertyName', () => {
        it('Should rename propertyC as propertyC_Renamed', () => {
            const demo = new DemoClassA();
            const pod = convertToPOD(demo);

            expect(pod['propertyC_Renamed']).not.toBe('undefined');
            expect(pod['propertyC']).toBe(undefined);
        });
    });
});