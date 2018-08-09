import {
    exclude,
    FirestoreData,
    index,
    ingoreExtraProperties,
    propertyName,
    subCollection,
} from '../src/helpers/firestore-data-annotations';


class DemoClassA extends FirestoreData {

    @index()
    public id: string;

    public propertyA: string;

    @propertyName()
    public propertyB: string;

    @propertyName('propertyC_renamed')
    public propertyC: string;

    @exclude()
    public propertyD: string;

    @subCollection('propertyE_Renamed')
    public propertyE: DemoClassB[];

    public constructor() {
        super();
        this.id = 'test-id';
        this.propertyA = 'Test A';
        this.propertyB = 'Test B';
        this.propertyC = 'Test C';
        this.propertyD = 'Test D';
        this.propertyE = [
            new DemoClassB(),
            new DemoClassB()
        ];
    }

    public funcA(): void {
        console.log('Called funcA.');
    }

    public funcB(): void {
        console.log('Called funcB.');
    }
}

@ingoreExtraProperties()
class DemoClassB extends FirestoreData {

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
        super();
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
        it('Ignores properties without attributes.', () => {
            const demo = new DemoClassB();
            const pod = demo.toFirestoreDataObject();

            expect(pod.data['propertyA']).toBe(undefined);
            expect(demo.propertyA).not.toBe(undefined);

            for (const prop in pod) {
                const type = typeof pod[prop];
                expect(type).not.toBe('function');
            }
        });

        it('Doesn\'t ignore properties with attributes.', () => {
            const demo = new DemoClassA();
            const pod = demo.toFirestoreDataObject();

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
            const pod = demo.toFirestoreDataObject();

            expect(pod.id).toBe(demo.id);
        });
    });

    describe('#exclude', () => {
        it('Should not include the property propertyD.', () => {
            const demo = new DemoClassA();
            const pod = demo.toFirestoreDataObject();

            expect(pod['propertyD']).toBe(undefined);
        });
    });

    describe('#propertyName', () => {
        it('Should rename propertyC as propertyC_Renamed', () => {
            const demo = new DemoClassA();
            const pod = demo.toFirestoreDataObject();

            expect(pod['propertyC_Renamed']).not.toBe('undefined');
            expect(pod['propertyC']).toBe(undefined);
        });
    });

    describe('#subCollection', () => {
        it('Should have marked propertyE as a subcollection.', () => {
            const demo = new DemoClassA();
            const pod = demo.toFirestoreDataObject();

            expect(pod.subcollections.length).toBe(1);
            expect(pod.subcollections[0].values.length).toBe(2);
            expect(pod.subcollections[0].values[0]).not.toBe(undefined);
            expect(pod.subcollections[0].name).toBe('propertyE_Renamed');
        });
    });
});