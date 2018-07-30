import express, { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { LockableService } from '../services/lockable-service';
import { NotImplementedError, MessageError } from '../models/errors';
import { LockableData,
    Lockable,
    isLockableData,
    GenericLockableData,
    isGenericLockableData
} from '../models/lockable';
import { getAllGroups } from '../helpers/regex-helpers';
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
lockablesController.post('/lockable/new', (req: Request, res: Response) => {
    const data: LockableData|GenericLockableData = req.body;
    let _lockable: Lockable|GenericLockableData;

    if (isLockableData(data)) {
        _lockable = new Lockable(data);
    } else if (isGenericLockableData(data)) {
        _lockable = data;
    } else {
        res.json(new MessageError('Invalid request body.'));
        return;
    }

    lockableService.create(_lockable)
        .then(lockable => res.json(lockable))
        .catch(e => res.json(e));
});

lockablesController.get('/lockable/by/:field/:name', (req: Request, res: Response) => {
    const method: string = req.params.field;
    const value: string = req.params.name;

    if (method === 'id' || method === 'name' || method === 'createdOn') {
        lockableService.retrieve(method, value)
            .then(lockable => res.json(lockable))
            .catch(e => res.json(e));
    } else if (method === 'categories') {
        const categories = value.split('/');
        lockableService.retrieveLatestInCategory(categories)
            .then(lockable => res.json(lockable))
            .catch(error => res.json(error));
    } else {
        res.json(new Error(`Method (${method}) isn't supported.`));
        return;
    }
});

lockablesController.put('/lockable', (req: Request, res: Response) => {
    const data = req.body;

    if (isLockableData(data)) {
        const lockable = new Lockable(data);
        lockableService.update(lockable)
            .then(_lockable => res.json(_lockable))
            .catch(e => res.json(e));
    } else {
        res.json(new Error('Request body wasn\'t in correct format.'));
    }
});

lockablesController.delete('/lockable/by/:field/:name', (req: Request, res: Response) => {
    const method: string = req.params.field;
    const value: string = req.params.name;

    if (method === 'id' || method === 'name') {
        lockableService.delete(method, value)
            .then(success => res.json(success))
            .catch(e => res.json(e));
    } else {
        res.json(new NotImplementedError());
    }
});

/**
 * Pagination for lockables.
 */
lockablesController.post('/lockables', (req: Request, res: Response) => {
    if (!isPaginate<Lockable>(req.body)) {
        res.json(new Error('Invalid request body.'));
    }

    lockableService.paginate(req.body)
        .then(results => res.json(results))
        .catch(error => res.json(error));
});

/**
 * First capture group will be equal to one of the following:
 * 1) id
 * 2) name
 * 3) category
 *
 * Second capturing group will match the rest of the url.
 */
const lockByRegex = /^\/lock\/by\/(id|name|category)((?:\/\w+)+)$/g;

/**
 * Adds a lock to a lockable.
 *
 * Url pattern looks like this:
 * .../api/lock/by/id/123123123
 * .../api/lock/by/name/alexHayes
 * .../api/lock/by/category/categoryA/subCategoryB/
 */
lockablesController.post(/^\/lock(?:\/\w+)+$/, (req: Request, res: Response) => {
    const lock: GenericLockData = req.body;

    if (!isGenericLockData(lock)) {
        res.json(new MessageError('Request body in invalid format.'));
        return;
    }

    const matches = getAllGroups(lockByRegex, req.url);
    const match = matches[0];
    const method: string = match[0];
    const value: string = match[1];

    switch (method) {
        case 'id':
        case 'name':
            lockableService.retrieve(method, value)
                .then(lockable => lockableService.lock(lockable, lock))
                .then(result => res.json(result))
                .catch(e => res.json(e));
            return;

        case 'category':
            const categories = value.split('/');
            lockableService.retrieveLatestInCategory(categories,
                    lock.isShared,
                    false)
                .then(lockable => lockableService.lock(lockable, lock))
                .then(lockable => res.json(lockable))
                .catch(error => res.json(error));
            break;

        default:
            res.json(new NotImplementedError());
            return;
    }

    // Shouldn't reach here.
    res.json(new NotImplementedError());
});

/**
 * Removes a lock from a lockable.
 *
 * Url pattern looks like this:
 * .../api/unlock/ittp/users/12340123412
 *
 * Where ittp and users are categories and 12340123412 is the id of the
 * lockable.
 */
lockablesController.post(/^\/api\/unlock(?:\/\w+)+\/(\w+)/, (req: Request, res: Response) => {
    const data = req.body;
    res.json(new NotImplementedError());
});