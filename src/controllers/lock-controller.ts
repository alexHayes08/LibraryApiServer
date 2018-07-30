import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { LockService } from '../services/lock-service';
import { isPaginate, Paginate } from '../models/paginate';
import { GenericLockData } from '../models/lock';

// const newCategoryRegex = /\/category((?:\/\w+)+)$/g;
// const retrieveCategoryRegex = /\/category\/by\/(id|name)((?:\/\w+)+)$/g;

// Retrieve the lock service
const lockService = container.get<LockService>(TYPES.LockService);

export const lockController = express.Router({
    mergeParams: true
});

lockController.get('/inactive-lock/:id', (req: Request, res: Response) => {
    lockService.retrieve('id', req.params.id)
        .then(lock => res.json(lock))
        .catch(error => res.json(error));
});

lockController.post('/inactive-locks/', (req: Request, res: Response) => {
    const paginationData: Paginate<GenericLockData> = req.body;

    if (!isPaginate(paginationData)) {
        res.json(new Error('Invalid request body.'));
        return;
    }

    lockService.paginate(paginationData)
        .then(results => res.json(results))
        .catch(error => res.json(error));
});
