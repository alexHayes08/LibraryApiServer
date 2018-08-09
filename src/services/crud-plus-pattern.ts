import { Paginate, PaginationResults } from '../models/paginate';

/**
 * A CRUD+ pattern interface for storing/retreiving/creating objects. The 'T'
 * type parameter is the 'full' version of the object, the 'U' type parameter
 * is the model used to construct new types of 'T', and the 'V' is a 'limited'
 * type parameter returned when paginating (foreign keys/subcollections won't
 * be populated).
 */
export interface CrudPlusPattern<T, U> {
    create(model: U): Promise<T>;
    retrieve<U extends keyof T>(fieldName: U, value: T[U]): Promise<T>;
    update(model: T): Promise<T>;
    delete<U extends keyof T>(fieldName: U, value: T[U]): Promise<boolean>;
    paginate(data: Paginate<T>): Promise<PaginationResults<T>>;
}