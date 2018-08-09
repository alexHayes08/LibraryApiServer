import 'reflect-metadata';
import { DocumentReference } from '@google-cloud/firestore';

/**
 * Internal class used to store metadata for converting an object into a valid
 * Firestore data object.
 */
class AnnotationMetadata {
    private setIndexAlready: boolean = false;
    private _index: string = 'id';

    /**
     * Flag for ignoring extra properties.
     */
    public ignoreExtraProperties: boolean = false;

    /**
     * The key is the original property name and the value is the new name.
     */
    public propertyNames: Map<string, string> = new Map();

    /**
     * Array of property names to ignore.
     */
    public exclude: string[] = [];

    /**
     * Array of property names that will be defined as sub-collections.
     */
    public subcollections: string[] = [];

    public get index() {
        return this._index;
    }

    public set index(value: string) {
        if (this.setIndexAlready) {
            throw new Error('Cannot have multiple @index attributes.');
        }

        this.setIndexAlready = true;
        this._index = value;
    }
}

export interface FSArray {
    name: string;
    values: FSObject[];
}

export interface FSObject {
    id?: string;
    data: {
        [key: string]: any;
    };
    subcollections: FSArray[];
}

const FS_TYPE_ANNOTATIONS_KEY = Symbol.for('FS_TYPE_ANNOTATIONS_KEY');

function assertTargetIsNotStatic(target: any): void {
    if (target.constructor === undefined) {
        throw new Error('Cannot apply to static member.');
    }
}

function retrieveData(prototype: object): AnnotationMetadata {
    return Reflect.getMetadata(FS_TYPE_ANNOTATIONS_KEY, prototype)
        || new AnnotationMetadata();
}

function storeData(prototype: object, data: AnnotationMetadata): void {
    Reflect.defineMetadata(FS_TYPE_ANNOTATIONS_KEY, data, prototype);
}

/**
 * Class decorator to ignore any properties missing an annotation when
 * converting the object to a Firestore object.
 */
export function ingoreExtraProperties() {
    return (target: any) => {
        assertTargetIsNotStatic(target);
        const data = retrieveData(target.prototype);
        data.ignoreExtraProperties = true;
        storeData(target.prototype, data);
    };
}

/**
 * Identifies the field/property to use as the id of the object.
 */
export function index() {
    return (target: Function|any, propertyKey: string) => {
        assertTargetIsNotStatic(target);
        const data = retrieveData(target);
        data.index = propertyKey;
        storeData(target, data);
    };
}

/**
 * Ignores the property when parsing the object to an Firestore object.
 */
export function exclude() {
    return (target: any, propertyKey: string) => {
        assertTargetIsNotStatic(target);
        const data = retrieveData(target);
        data.exclude.push(propertyKey);
        storeData(target, data);
    };
}

/**
 * Will include the property if the class is decorated with
 * @ignoreExtraProperties this attribute will make sure the property is
 * included.
 * @param as What the property will be renamed during conversion. If undefined
 * then the property won't be renamed.
 */
export function propertyName(as?: string) {
    return (target: any, name: string) => {
        assertTargetIsNotStatic(target);
        const data = retrieveData(target);
        data.propertyNames.set(name, as || name);
        storeData(target, data);
    };
}

/**
 * ONLY USE ON ARRAYS! Will instruct Firestore to store the array in a
 * sub-collection. The properties in array MUST extend FirestoreData. They
 * cannot be primitives. Also don't apply the attribute @propertyName() to the
 * same property as @subCollection().
 */
export function subCollection(as?: string) {
    return (target: any, name: string) => {
        assertTargetIsNotStatic(target);
        const data = retrieveData(target);
        data.subcollections.push(name);
        data.propertyNames.set(name, (as === undefined ? name : as));
        storeData(target, data);
    };
}

/**
 * Provides the toFirestoreDataObject() which converts 'this' into a valid
 * JSON object.
 */
export class FirestoreData {

    /**
     * Converts 'this' into a JSON valid object. The returned object will
     * return all fields that can be serialized.
     */
    public toFirestoreDataObject(): FSObject {
        const obj: any = this;
        const proto = Object.getPrototypeOf(obj);
        const data = retrieveData(proto);

        const result: FSObject = {
            id: undefined,
            data: {},
            subcollections: []
        };

        // Assign id if data.index is set
        if (data.index) {
            result.id = obj[data.index];
        }

        const propertyNameKeys = Array.from(data.propertyNames.keys());

        // If data.ignoreExtraProps is true, only set the props listed in
        // data.propertyNames.
        if (data.ignoreExtraProperties) {
            for (const prop of propertyNameKeys) {
                const value = obj[prop];

                // Check if subcollection
                if (data.subcollections.find(key => key === prop) === undefined) {
                    result.data[data.propertyNames.get(prop)] = value;
                } else {

                    // Ignore if not an array or empty
                    if (!Array.isArray(value) || value.length === 0) {
                        continue;
                    }

                    const fsObj: FSArray = {
                        name: data.propertyNames.get(prop),
                        values: []
                    };

                    for (const element of value) {
                        if ((element.prototype || element.constructor.prototype) === FirestoreData) {
                            fsObj.values.push(element.toFirestoreDataObject());
                        } else {
                            fsObj.values.push(element);
                        }
                    }

                    result.subcollections.push(fsObj);
                }
            }
        } else {

            // Assign all properties
            for (const prop in obj) {
                const value = obj[prop];

                if (prop === data.index) {

                    // Ignore if it's the data.index prop.
                    continue;
                } else if (typeof value === 'function') {

                    // Ignore if it's a method.
                    continue;
                } else if (data.exclude.find(el => el === prop)) {

                    // Ignore if it's listed in the exclude array.
                    continue;
                }

                // Handle all arrays and objects here.
                const propType = typeof value;
                if (Array.isArray(value)) {

                    // Ignore empty arrays
                    if (value.length === 0) {
                        continue;
                    }

                    // Get the first element.
                    const first = value[0];
                    const subCollection: FSArray = {
                        name: data.propertyNames.get(prop),
                        values: []
                    };

                    // Check if it's an object is either a primitive or an
                    // object which extends FirestoreData.
                    if (typeof first === 'object'
                        && first.constructor.prototype instanceof FirestoreData
                    ) {
                        for (const fd of obj[prop]) {
                            const pod = fd.toFirestoreDataObject();
                            subCollection.values.push(pod);
                        }

                        result.subcollections.push(subCollection);
                    } else {

                        // Handle normal objects here.
                        for (const element of obj[prop]) {
                            subCollection.values.push({
                                data: element,
                                subcollections: []
                            });
                        }

                        result.subcollections.push(subCollection);
                    }
                } else if (propType === 'object'
                    && value.constructor.prototype instanceof FirestoreData
                ) {
                    // Handle objects which extend the FirestoreData class.
                    const pod = value.toFirestoreDataObject();

                    if (propertyNameKeys.find(key => key === prop)) {
                        result.data[data.propertyNames.get(prop)] = pod;
                    } else {
                        result.data[prop] = pod;
                    }
                } else if (propType !== 'function') {

                    // Handle primitives here
                    if (propertyNameKeys.find(key => key == prop)) {
                        result.data[data.propertyNames.get(prop)] = obj[prop];
                    } else {
                        result.data[prop] = obj[prop];
                    }
                }
            }
        }

        return result;
    }
}