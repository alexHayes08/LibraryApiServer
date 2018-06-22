import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { getAllGroups } from '../helpers/regex-helpers';
import { Category } from '../models/category';
import { NotImplementedError } from '../models/errors';
import { Paginate } from '../models/paginate';
import { CategoryService } from '../services/category-service';
import { CategoryLockableMapService } from '../services/category-lockable-map-service';

const newCategoryRegex = /\/category((?:\/\w+)+)$/g;
const retrieveCategoryRegex = /\/category\/by\/(id|name)((?:\/\w+)+)$/g;

// Get the category service
const categoryService: CategoryService =
    container.get<CategoryService>(TYPES.CategoryService);

// Get the categoryLockableMap service
const categoryLockableMapService: CategoryLockableMapService =
    container.get<CategoryLockableMapService>(TYPES.CategoryLockableMapService);

export const categoryController = express.Router({
    mergeParams: true
});

// Get all sites
categoryController.post('/categories/', (req: Request, res: Response) => {
    const {
        orderBy = 'name',
        limit = 10,
        startAfter,
        endAt,
        filter
    } = req.body;

    const paginate: Paginate<Category> = {
        orderBy,
        limit,
        startAfter,
        endAt,
        filter
    };

    categoryService.paginate(paginate)
        .then(val => res.json(val))
        .catch(e => res.json(e));
});

// Get global settings
categoryController.get('/settings/', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
});

// Retrieve a category.
categoryController.get(/\/category\/by\/(?:id|name)(?:\/\w+)+$/, (req: Request, res: Response) => {
    const groups = getAllGroups(retrieveCategoryRegex, req.url);

    if (groups.length === 0 || groups[0].length === 0) {
        res.json(new Error('Malformed url.'));
    }

    const group = groups[0];
    const method = group[0];
    const value = group[1];

    // Verify the method is valid.
    if (method === 'id' || method === 'name') {
        categoryService.retrieve(method, value)
            .then(category => res.json(category))
            .catch(e => res.json(e));
    } else {
        res.json(new NotImplementedError());
    }
});

// Delete a category
categoryController.delete('/categories', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
    // const deletables = [];

    // const categoriesQ = Datastore.createQuery(req.params.sitename, 'category');
    // const lockablesQuery = Datastore.createQuery(req.params.sitename, 'lockable');
    // const settingsQuery = Datastore.createQuery(req.params.sitename, 'Settings');

    // Datastore.runQuery(categoriesQ)
    //     .then((data) => {
    //         data[0].map((entity) => deletables.push(entity[Datastore.KEY]))
    //     }).then(() => {
    //         return Datastore.runQuery(lockablesQuery)
    //     }).then((data) => {
    //         data[0].map((entity) => deletables.push(entity[Datastore.KEY]));
    //     }).then(() => {
    //         return Datastore.runQuery(settingsQuery)
    //     }).then((data) => {
    //         data[0].map((entity) => deletables.push(entity[Datastore.KEY]))
    //     }).then(() => {
    //         var deleteGroups = [];
    //         var numberOfDeleteGroups = deletables.length / 400;

    //         for (var i = 0; i < numberOfDeleteGroups; i += 400) {
    //             deleteGroups.push(deletables.slice(i, i + 400));
    //         }

    //         var lastPromise = deleteGroups.reduce(function (sum, value) {
    //             return sum.then(() => Datastore.delete(value));
    //         }, Promise.resolve());

    //         lastPromise.then(() => {
    //             ResponseTemplates.HandleGoodResponse(res);
    //         }).catch(() => {
    //             ResponseTemplates.HandleErrorResponse(res, 500, error);
    //         });
    //     }).catch((error) => {
    //         ResponseTemplates.HandleErrorResponse(res, 400, error);
    //     });
});

/**
 * Creates a new category.
 *
 * Url pattern:
 * .../api/category/parentCategoryA/subParentCategoryB/newCategory
 *
 * Where parentCategoryA is the root category, subParentCategoryB is a child
 * category of parentCategoryA, and newCategory is a sub-category of
 * subParentCategoryB.
 *
 * If the category is a root category then the url can be the following:
 * .../api/category/newCategory
 *
 * Which will create a new root category named newCategory.
 */
categoryController.post(/\/category(?:\/\w+)+$/, (req: Request, res: Response) => {
    const matches = getAllGroups(newCategoryRegex, req.url);

    if (matches.length === 0 || matches[0].length === 0) {
        res.json(new Error('Malformed url.'));
    }

    const parentCategories = matches[0][0].split('/').filter(el => el !== '');
    const newCategoryName = parentCategories.pop();

    categoryService.create(newCategoryName, parentCategories)
        .then(category => res.json(category))
        .catch(e => res.json(e));
    // const newSiteName = req.params.sitename;
    // const key = Datastore.key({
    //     namespace: newSiteName,
    //     path: ['Settings', 'ShardCount']
    // });
    // Datastore.save({
    //     key: key,
    //     data: {
    //         count: settings.DEFAULT_NUMBER_OF_SHARDS
    //     }
    // }).then((result) => {
    //     stdGoodResponseTemplate(res);
    // }).catch((error) => {
    //     stdErrorTemplate(res, 400, error)
    // });
});
