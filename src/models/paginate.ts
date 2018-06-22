import { OrderByDirection, FieldPath, WhereFilterOp } from '@google-cloud/firestore';

export interface OrderBy {
    fieldPath: string|FieldPath;
    directionStr?: OrderByDirection;
}

export interface Paginate<T> {
    orderBy: OrderBy[];
    limit: number;
    filter?: Filter;
    startAfter?: T;
    endAt?: T;
}

export interface Filter {
    field: string|FieldPath;
    comparator: WhereFilterOp;
    value: any;
}

export interface PaginationResults<T> {
    results: T[];
    next: Paginate<T>;
    previous: Paginate<T>;
}