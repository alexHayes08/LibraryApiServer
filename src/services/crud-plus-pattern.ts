import { Paginate, PaginationResults } from '../models/paginate';

export interface CrudPlusPattern<T> {
    create(model: T): Promise<T>;
    retrieve<U extends keyof T>(fieldName: U, value: T[U]): Promise<T>;
    update(model: T): Promise<T>;
    delete<U extends keyof T>(fieldName: U, value: T[U]): Promise<boolean>;
    paginate(data: Paginate<T>): Promise<PaginationResults<T>>;
}