import { CrudPlusPattern } from '../services/crud-plus-pattern';
import { Entity } from '../models/entity';

/**
 * Creates n items using the itemGenerator function to generate the models
 * which are saved by the crudService.
 * @param n Number of items to create.
 * @param itemGenerator Function used to generate the models. Is passed the
 * current iteration (zero-based).
 * @param crudService
 */
export async function createItems<T, U>(n: number,
        itemGenerator: (i: number) => U,
        crudService: CrudPlusPattern<T, U>) {
    const items: T[] = [];

    for (let i = 0; i < n; i++) {
        const item = itemGenerator(i);
        items.push(await crudService.create(item));
    }

    return items;
}

/**
 * Will delete all items by id using the CRUD service.
 * @param items
 * @param crudService
 */
export async function deleteItems<T extends Entity, U>(items: T[],
        crudService: CrudPlusPattern<T, U>) {
    for (const item of items) {
        await crudService.delete('id', item.id);
    }

    items = [];
}