import 'reflect-metadata';

class AnnotationMetadata {
    private setIndexAlready: boolean = false;
    private _index: string = 'id';

    public ignoreExtraProperties: boolean = false;
    public propertyNames: Map<string, string> = new Map();
    public exclude: string[] = [];

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

interface FSObject {
    id?: string;
    data: {
        [key: string]: any;
    };
}

const FS_TYPE_ANNOTATIONS_KEY = Symbol.for('FS_TYPE_ANNOTATIONS_KEY');

function assertTargetIsNotStatic(target: any): void {
    if (target.constructor === undefined) {
        throw new Error('Cannot apply to static member.');
    }
}

export function retrieveData(prototype: object): AnnotationMetadata {
    return Reflect.getMetadata(FS_TYPE_ANNOTATIONS_KEY, prototype)
        || new AnnotationMetadata();
}

export function storeData(prototype: object, data: AnnotationMetadata): void {
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

export function convertToPOD(obj: any) {
    const proto = Object.getPrototypeOf(obj);
    const data = retrieveData(proto);

    const result: FSObject = {
        id: undefined,
        data: {}
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
            result.data[data.propertyNames.get(prop)] = obj[prop];
        }
    } else {

        // Assign all other props
        for (const prop in obj) {
            if (prop === data.index) {

                // Ignore if it's the data.index prop.
                continue;
            } else if (typeof obj[prop] == 'function') {

                // Ignore if it's a method.
                continue;
            } else if (data.exclude.find(el => el === prop)) {

                // Ignore if it's listed in the exclude array.
                continue;
            }

            if (propertyNameKeys.find(key => key == prop)) {
                result.data[data.propertyNames.get(prop)] = obj[prop];
            } else {
                result.data[prop] = obj[prop];
            }
        }
    }

    return result;
}