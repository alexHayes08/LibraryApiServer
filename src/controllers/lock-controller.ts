import { NotImplementedError } from './../models/errors';
import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { CategoryLockableMapService } from '../services/category-lockable-map-service';

const newCategoryRegex = /\/category((?:\/\w+)+)$/g;
const retrieveCategoryRegex = /\/category\/by\/(id|name)((?:\/\w+)+)$/g;

// Get the categoryLockableMap service
const categoryLockableMapService: CategoryLockableMapService =
    container.get<CategoryLockableMapService>(TYPES.CategoryLockableMapService);

export const lockController = express.Router({
    mergeParams: true
});

lockController.get('/locks/of/:id', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
});
