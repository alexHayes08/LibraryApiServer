import { Paginate, PaginationResults } from '../models/paginate';
import { Entity } from '../models/entity';

/**
 * A CRUD+ pattern interface for storing/retreiving/creating objects. The 'T'
 * type parameter is the 'full' version of the object, the 'U' type parameter
 * is the model used to construct new types of 'T', and the 'V' is a 'limited'
 * type parameter returned when paginating (foreign keys/subcollections won't
 * be populated).
 */
export interface CrudPlusPattern<T extends Entity, U> {
    create(model: U): Promise<T>;
    createMany(models: U[]): Promise<PaginationResults<T>>;
    retrieve<U extends keyof T>(fieldName: U, value: T[U]): Promise<T>;
    update(model: T): Promise<T>;
    updateMany(models: T[]): Promise<PaginationResults<T>>;
    delete<V extends keyof T>(fieldName: V, value: T[V]): Promise<boolean>;
    deleteMany<V extends keyof T>(fieldName: V, values: T[V][]): Promise<boolean>;
    paginate(data: Paginate<T>): Promise<PaginationResults<T>>;
}
