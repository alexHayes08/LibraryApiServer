import express from 'express';
import { Request, Response } from 'express';
import { inject } from 'inversify';

import { container, TYPES } from '../dependency-registrar';
import { CategoryService } from '../services/category-service';
import { Category } from '../models/category';
import { NotImplementedError } from '../models/errors';

// Get the site service
const sitepoolService: CategoryService =
    container.get<CategoryService>(TYPES.CategoryService);

// const sitePool = new Category({
//     name: 'test',
//     id: '123',
// });
// sitepoolService.delete('name', '123');

export const sitesController = express.Router({
    mergeParams: true
});


// Get all sites
sitesController.get('/sites/', (req: Request, res: Response) => {
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
sitesController.get('/settings/', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
});

// Get sitepool specific settings
sitesController.get('/site/:sitename', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
});

// Get all categories in site
sitesController.get('/site/:sitename', (req: Request, res: Response) => {

    // Validate the sitename
    if (req.params.sitename == undefined) {
        res.json(new Error('Need to specify the sitename.'));
    }

    sitepoolService.retrieve('name', req.params.sitename);
    // const query = Datastore.createQuery(req.params.sitename, 'category');
    // .select("name");
    // .filter("name", req.params.sitename);

    // _firestoreService.categories.list({ pageSize: 10 })
    //     .then(categories => HandleGoodResponse(res, null, categories))
    //     .catch(error => HandleErrorResponse(res, 500, error));

    // Datastore.runQuery(query)
    //     .then((entities) => {
    //         var cleanEntities = [];
    //         entities[0].forEach((entity) => {
    //             cleanEntities.push(entity[Datastore.KEY].name);
    //         });
    //         ResponseTemplates.HandleGoodResponse(res, null, cleanEntities);
    //     }).catch((error) => {
    //         stdErrorTemplate(res, 400, error)
    //     });
});

// Delete a SitePool
export const deleteSite = function (req: Request, res: Response) {
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
};

// Create new SitePool
export const putNewSitePool = function (req: Request, res: Response) {
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
};
