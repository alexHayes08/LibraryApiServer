import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { LockableService } from '../services/lockable-service';
import { MessageError } from '../models/errors';
import { LockableData,
    Lockable,
    isLockableData,
    GenericLockableData,
    isGenericLockableData
} from '../models/lockable';
import { GenericLockData, isGenericLockData } from '../models/lock';
import { isPaginate } from '../models/paginate';

const lockableService: LockableService =
    container.get<LockableService>(TYPES.LockableService);

export const lockablesController = express.Router({
    mergeParams: true
});

/**
 * Creates a lockable.
 */
lockablesController.post('/lockable/create', (req: Request, res: Response) => {
    const data: LockableData|GenericLockableData = req.body;
    let _lockable: Lockable|GenericLockableData;

    if (isLockableData(data)) {
        _lockable = new Lockable(data);
    } else if (isGenericLockableData(data)) {
        _lockable = data;
    } else {
        res.status(400).json(new MessageError('Invalid request body.'));
        return;
    }

    lockableService.create(_lockable)
        .then(lockable => res.json(lockable))
        .catch(e => res.status(500).json(e));
});

lockablesController.post('/lockable/create-many', (req: Request, res: Response) => {
    const lockableData: GenericLockableData = req.body;

    // Validate request body.
    if (!Array.isArray(lockableData)) {
        res.status(400).json(new MessageError('Invalid request body.'));
        return;
    }

    for (const lockable of lockableData) {
        if (!isGenericLockableData(lockable)) {
            res.status(400).json(new MessageError('Invalid request body.'));
            return;
        }
    }

    lockableService.createMany(lockableData)
        .then(lockables => res.json(lockables))
        .catch(error => res.status(500).json(error));
});

lockablesController.post('/lockable/retrieve', (req: Request, res: Response) => {
    const method: string = req.body.method;

    if (method === 'id' || method === 'name' || method === 'createdOn') {
        const value: string = req.body.value;

        if (typeof value !== 'string') {
            res.status(400).json(new Error('The request body had an invalid'
                + ' field: value. Expected the type of the field to be a'
                + ' string.'));
            return;
        }

        lockableService.retrieve(method, value)
            .then(lockable => res.json(lockable))
            .catch(e => res.status(500).json(e));
    } else if (method === 'categories') {
        const categories = req.body.value;

        // Verify categories is an array.
        if (!Array.isArray(categories)) {
            res.status(400).json(new Error('The request body had an invalid'
                + ' field: value. When the method is categories the value must'
                + ' be an array.'));
            return;
        }

        lockableService.retrieveLatestInCategory(categories)
            .then(lockable => res.json(lockable))
            .catch(error => res.status(500).json(error));
    } else {
        res.status(400).json(new Error(`Method (${method}) isn't supported.`));
        return;
    }
});

lockablesController.put('/lockable/update', (req: Request, res: Response) => {
    const data = req.body;

    if (isLockableData(data)) {
        const lockable = new Lockable(data);
        lockableService.update(lockable)
            .then(_lockable => res.json(_lockable))
            .catch(e => res.status(500).json(e));
    } else {
        res.status(400)
            .json(new Error('Request body wasn\'t in correct format.'));
        return;
    }
});

lockablesController.post('/lockable/delete', (req: Request, res: Response) => {
    const method: string = req.body.field;
    const value: string = req.body.method;

    if (typeof method !== 'string') {
        res.status(400).json(new Error('The request body had an invalid'
                + ' field: method. Expected the type of the field to be a'
                + ' string.'));
            return;
    } else if (typeof value !== 'string') {
        res.status(400).json(new Error('The request body had an invalid'
                + ' field: value. Expected the type of the field to be a'
                + ' string.'));
            return;
    }

    if (method === 'id' || method === 'name') {
        lockableService.delete(method, value)
            .then(success => res.json(success))
            .catch(e => res.status(500).json(e));
    } else {
        res.status(400)
            .json(new Error('Method can be either \'id\' or \'name\'.'));
            return;
    }
});

/**
 * Pagination for lockables.
 */
lockablesController.post('/lockable/paginate', (req: Request, res: Response) => {
    if (!isPaginate<Lockable>(req.body)) {
        res.status(400).json(new Error('Invalid request body.'));
        return;
    }

    lockableService.paginate(req.body)
        .then(results => res.json(results))
        .catch(error => res.status(500).json(error));
});

/**
 * Adds a lock to a lockable.
 */
lockablesController.post('/lockable/lock/', (req: Request, res: Response) => {
    const lock: GenericLockData = req.body.lock;
    const lockableId: string = req.body.lockableId;

    if (!isGenericLockData(lock)) {
        res.status(400)
            .json(new MessageError('Request body in invalid format.'));
        return;
    } else if (typeof lockableId !== 'string') {
        res.status(400)
            .json(new Error('Request body had an invalid field.'
                + ' Expected \'lockableId\' to be a string.'));
        return;
    }

    lockableService.retrieve('id', lockableId)
        .then(lockable => lockableService.lock(lockable, lock))
        .then(result => res.json(result))
        .catch(e => res.status(500).json(e));
});

/**
 * Removes a lock from a lockable.
 */
lockablesController.post('/lockable/unlock', (req: Request, res: Response) => {
    const lockId = req.body.lockId;
    const lockableId = req.body.lockableId;

    if (typeof lockId !== 'string') {
        res.status(400)
            .json(new Error('Invalid request body. Expected the field'
                + ' \'lockId\' to be a string.'));
    } else if (typeof lockableId !== 'string') {
        res.status(400)
            .json(new Error('Invalid request body. Expected the field'
                + ' \'lockableId\' to be a string.'));
    }

    lockableService.retrieve('id', lockableId)
        .then(lockable => lockableService.unlock(lockable, lockId))
        .then(lockable => res.json(lockable))
        .catch(error => res.status(500).json(error));
});