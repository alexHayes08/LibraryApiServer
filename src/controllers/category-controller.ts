import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { NotImplementedError } from '../models/errors';
import { CategoryService } from '../services/category-service';

// Get the site service
const sitepoolService: CategoryService =
    container.get<CategoryService>(TYPES.CategoryService);

export const categoryController = express.Router({
    mergeParams: true
});

// Get all sites
categoryController.get('/categories/', (req: Request, res: Response) => {
    sitepoolService.paginate({
        orderBy: [
            { fieldPath: 'name' }
        ],
        limit: 10
    })
    .then(val => res.json(val))
    .catch(e => res.json(e));
});

// Get global settings
categoryController.get('/settings/', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
});

// Get category specific settings
categoryController.get('/category/:categoryname', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
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

// Create new category
categoryController.put('/category/:categoryname', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
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
