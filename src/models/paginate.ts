import { OrderByDirection, FieldPath, WhereFilterOp } from '@google-cloud/firestore';

export interface OrderBy {
    fieldPath: string|FieldPath;
    directionStr?: OrderByDirection;
}

export interface Paginate<T> {
    orderBy?: OrderBy[];
    limit: number;
    filters?: Filter<T>[];
    skip?: number;
}

export interface Filter<T> {
    field: string|FieldPath|keyof T;
    comparator: WhereFilterOp;
    value: any;
}

export interface PaginationResults<T> {
    results: T[];
    next?: Paginate<T>;
    previous?: Paginate<T>;
}

export function isComparator(value: any): value is WhereFilterOp {
    return value !== undefined
        && (value == '>'
            || value == '>='
            || value == '=='
            || value == '<='
            || value == '<');
}

export function isOrderBy(value: any): value is OrderBy {
    return value !== undefined
        && value.fieldPath !== undefined;
}

export function isPaginate<T>(value: any): value is Paginate<T> {
    return value !== undefined
        && value.limit !== undefined;
}

export function isPaginationResults<T>(value: any): value is PaginationResults<T> {
    return value !== undefined
        && value.results !== undefined
        && Array.isArray(value.results);
}