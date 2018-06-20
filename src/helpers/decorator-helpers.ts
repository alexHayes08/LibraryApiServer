import 'reflect-metadata';

export interface DecoratorArgs {
    target?: Function|any;
    name?: string;
    descriptor?: PropertyDescriptor;
    index?: number;
}

export interface ClassDecoratorArgs {

    /**
     * The constructor function.
     */
    target: Function;
}

/**
 * NOTE: Accessor decorators also use this.
 */
export interface FunctionDecoratorArgs {
    /**
     * Target is either the constructor function when called from a static
     * function or the prototype of the parent object.
     */
    target: Function|any;

    /**
     * Name of the member.
     */
    name: string;

    /**
     * The PropertyDescriptor of the function.
     */
    descriptor: PropertyDescriptor;
}

export interface PropertyDecoratorArgs {
    /**
     * Target is either the constructor function when called from a static
     * function or the prototype of the parent object.
     */
    target: Function|any;

    /**
     * Name of the member.
     */
    name: string;
}

export interface ParameterDecoratorArgs {
    /**
     * Target is either the constructor function when called from a static
     * function or the prototype of the parent object.
     */
    target: Function|any;

    /**
     * Name of the member.
     */
    name: string;

    /**
     * The ordinal index of the parameter in the function’s parameter list.
     */
    index: number;
}

export function isClassDecorator(value: any): value is ClassDecoratorArgs {
    return value !== undefined
        && value.target !== undefined
        && typeof value.target === 'function'
        && value.descriptor === undefined
        && value.name === undefined
        && value.index == undefined;
}

/**
 * NOTE: Use this for accessors as well.
 */
export function isFunctionDecorator(value: any): value is FunctionDecoratorArgs {
    return value !== undefined
        && value.target !== undefined
        && value.name !== undefined
        && value.descriptor !== undefined;
}

export function isPropertyDecorator(value: any): value is PropertyDecoratorArgs {
    return value !== undefined
        && value.target !== undefined
        && value.name !== undefined
        && value.descriptor === undefined
        && value.index === undefined;
}

export function isParameterDecorator(value: any): value is ParameterDecoratorArgs {
    return value !== undefined
        && value.target !== undefined
        && value.name !== undefined
        && value.index !== undefined;
}

export function argsToDecoratorArgs(args: any[]): object {
    const result: DecoratorArgs = {};

    if (args.length >= 1) {
        result.target = args[0];
    }

    if (args.length >= 2) {
        result.name = args[1];
    }

    if (args.length >= 3) {
        const val = args[2];
        if (typeof val === 'number') {
            result.index = val;
        } else {
            result.descriptor = val;
        }
    }

    return result;
}