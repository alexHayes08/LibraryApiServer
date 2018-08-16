import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { LockableService } from '../services/lockable-service';
import { MessageError, InternalError } from '../models/errors';
import { LockableData,
    Lockable,
    isLockableData,
    GenericLockableData,
    isGenericLockableData,
    isKeyOfLockableData
} from '../models/lockable';
import { GenericLockData, isGenericLockData } from '../models/lock';
import { isPaginate } from '../models/paginate';
import { errorToObj } from '../helpers/response-helpers';

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
        res.status(400).json(errorToObj(
            new MessageError('Invalid request body.')));
        return;
    }

    lockableService.create(_lockable)
        .then(lockable => res.json(lockable))
        .catch(e => res.status(500).json(errorToObj(e)));
});

/**
 * Creates multiple lockables.
 */
lockablesController.post('/lockable/create-many', (req: Request, res: Response) => {
    const lockableData: GenericLockableData = req.body.lockables;

    // Validate request body.
    if (!Array.isArray(lockableData)) {
        res.status(400).json(errorToObj(new MessageError('Invalid request body.')));
        return;
    }

    for (const lockable of lockableData) {
        if (!isGenericLockableData(lockable)) {
            res.status(400).json(errorToObj(new MessageError('Invalid request body.')));
            return;
        }
    }

    lockableService.createMany(lockableData)
        .then(lockables => res.json(lockables))
        .catch(error => res.status(500).json(errorToObj(error)));
});

/**
 * Retrieves a lockable.
 */
lockablesController.post('/lockable/retrieve', (req: Request, res: Response) => {
    const field: string = req.body.field;

    if (field === 'id' || field === 'name' || field === 'createdOn') {
        const value: string = req.body.value;

        if (typeof value !== 'string') {
            res.status(400).json(errorToObj(new Error('The request body had an'
                + ' invalid field: value. Expected the type of the field to be'
                + ' a string.')));
            return;
        }

        lockableService.retrieve(field, value)
            .then(lockable => res.json(lockable))
            .catch(e => res.status(500).json(errorToObj(e)));
    } else if (field === 'categories') {
        const categories = req.body.value;

        // Verify categories is an array.
        if (!Array.isArray(categories)) {
            res.status(400).json(errorToObj(new Error('The request body had an'
                + '  invalid field: value. When the method is categories the'
                + ' value must be an array.')));
            return;
        }

        lockableService.retrieveLatestInCategory(categories)
            .then(lockable => res.json(lockable))
            .catch(error => res.status(500).json(errorToObj(error)));
    } else {
        res.status(400).json(errorToObj(new MessageError(`Method (${field}) isn't supported.`)));
        return;
    }
});

/**
 * Updates a lockable.
 */
lockablesController.put('/lockable/update', (req: Request, res: Response) => {
    const data = req.body;

    if (isLockableData(data)) {
        const lockable = new Lockable(data);
        lockableService.update(lockable)
            .then(_lockable => res.json(_lockable))
            .catch(e => res.status(500).json(errorToObj(e)));
    } else {
        res.status(400)
            .json(errorToObj(new MessageError('Request body wasn\'t in correct format.')));
        return;
    }
});

/**
 * Updates multiple lockables.
 */
lockablesController.put('/lockables/update-many', (req: Request, res: Response) => {
    const lockableData: LockableData[] = req.body.lockables;

    // Validate request body.
    if (!Array.isArray(lockableData)) {
        res.status(400).json(new MessageError('Invalid request body.'));
        return;
    }

    for (const lockable of lockableData) {
        if (!isLockableData(lockable)) {
            res.status(400).json(errorToObj(new MessageError('Invalid request body.')));
        }
    }

    lockableService.updateMany(lockableData
            .map(lockable => new Lockable(lockable)))
        .then(paginationResults => res.json(paginationResults))
        .catch(error => {
            res.status(500).json(errorToObj(new InternalError(error)));
        });
});

/**
 * Deletes a lockable.
 */
lockablesController.post('/lockable/delete', (req: Request, res: Response) => {
    const field: string = req.body.field;
    const value: string = req.body.value;

    if (typeof field !== 'string') {
        res.status(400).json(errorToObj(new Error('The request body had an'
                + ' invalid field: method. Expected the type of the field to'
                + ' be a string.')));
            return;
    } else if (typeof value !== 'string') {
        res.status(400).json(errorToObj(new Error('The request body had an'
                + ' invalid field: value. Expected the type of the field to'
                + ' be a string.')));
            return;
    }

    if (field === 'id' || field === 'name') {
        lockableService.delete(field, value)
            .then(success => res.json(success))
            .catch(e => res.status(500).json(errorToObj(e)));
    } else {
        res.status(400)
            .json(errorToObj(
                new MessageError('Method can be either \'id\' or \'name\'.')));
            return;
    }
});

/**
 * Deletes multiple lockables.
 */
lockablesController.post('/lockables/delete-many', (req: Request, res: Response) => {
    const values = req.body.values;
    const field = req.body.field;

    if (!Array.isArray(values)) {
        res.status(400).json(new MessageError('Invalid request body.'));
        return;
    } else if (typeof field !== 'string') {
        res.status(400).json(new MessageError('Invalid request body.'));
        return;
    } else if (!isKeyOfLockableData(field)) {
        res.status(400).json(new MessageError('Invalid request body.'));
        return;
    }

    lockableService.deleteMany(field, values)
        .then(deletedAll => res.json(deletedAll))
        .catch((error: Error) => {
            res.status(500).json(errorToObj(new InternalError(error.message)));
            return;
        });
});

/**
 * Pagination for lockables.
 */
lockablesController.post('/lockable/paginate', (req: Request, res: Response) => {
    if (!isPaginate<Lockable>(req.body)) {
        res.status(400).json(errorToObj(new Error('Invalid request body.')));
        return;
    }

    lockableService.paginate(req.body)
        .then(results => res.json(results))
        .catch(error => res.status(500).json(errorToObj(error)));
});

/**
 * Adds a lock to a lockable.
 */
lockablesController.post('/lockable/lock/', (req: Request, res: Response) => {
    const lock: GenericLockData = req.body.lock;
    const lockableId: string = req.body.lockableId;

    if (!isGenericLockData(lock)) {
        res.status(400)
            .json(errorToObj(
                new MessageError('Request body in invalid format.')));
        return;
    } else if (typeof lockableId !== 'string') {
        res.status(400)
            .json(errorToObj(new Error('Request body had an invalid field.'
                + ' Expected \'lockableId\' to be a string.')));
        return;
    }

    lockableService.retrieve('id', lockableId)
        .then(lockable => lockableService.lock(lockable, lock))
        .then(result => res.json(result))
        .catch(e => res.status(500).json(errorToObj(e)));
});

/**
 * Removes a lock from a lockable.
 */
lockablesController.post('/lockable/unlock', (req: Request, res: Response) => {
    const lockId = req.body.lockId;
    const lockableId = req.body.lockableId;

    if (typeof lockId !== 'string') {
        res.status(400)
            .json(errorToObj(new MessageError('Invalid request body. Expected'
                + ' the field \'lockId\' to be a string.')));
    } else if (typeof lockableId !== 'string') {
        res.status(400)
            .json(errorToObj(new Error('Invalid request body. Expected the'
                + ' field \'lockableId\' to be a string.')));
    }

    lockableService.retrieve('id', lockableId)
        .then(lockable => lockableService.unlock(lockable, lockId))
        .then(lockable => res.json(lockable))
        .catch(error => res.status(500).json(errorToObj(error)));
});