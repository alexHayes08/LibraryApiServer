import express from 'express';
import { Request, Response } from 'express';

import { container, TYPES } from '../dependency-registrar';
import { LockableService } from '../services/lockable-service';
import { NotImplementedError } from '../models/errors';
import { LockableData, Lockable, isLockableData } from '../models/lockable';

const lockableService: LockableService =
    container.get<LockableService>(TYPES.LockableService);

export const lockablesController = express.Router({
    mergeParams: true
});

lockablesController.post('/lockable/:name', (req: Request, res: Response) => {
    const lockableName: string = req.params.name;
    const data: LockableData = req.body;
    let _lockable: Lockable|string;

    if (isLockableData(data)) {
        _lockable = new Lockable(data);
    } else {
        _lockable = lockableName;
    }

    lockableService.create(_lockable)
        .then(lockable => res.json(lockable))
        .catch(e => res.json(e));
});

lockablesController.get('/lockable/by/:field/:name', (req: Request, res: Response) => {
    const method: string = req.params.field;
    const value: string = req.params.name;

    if (method === 'id' || method === 'name') {
        lockableService.retrieve(method, value)
            .then(lockable => res.json(lockable))
            .catch(e => res.json(e));
    } else {
        res.json(new NotImplementedError());
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
 * First capture group will be one of the following:
 * 1) id
 * 2) name
 * 3) category
 *
 * Second capturing group will match the rest of the url.
 */
const lockByRegex = /^\/api\/lock\/by\/(id|name|category)((?:\/\w+)+)$/g;

/**
 * Adds a lock to a lockable.
 *
 * Url pattern looks like this:
 * .../api/lock/by/id/123123123
 * .../api/lock/by/name/alexHayes
 * .../api/lock/by/category/categoryA/subCategoryB/
 */
lockablesController.post(/^\/api\/lock(?:\/\w+)+$/, (req: Request, res: Response) => {
    const regexMatch = lockByRegex.exec(req.url);
    const method: string = regexMatch[0];
    const value: string = regexMatch[1];

    switch (method) {
        case 'id':
            break;

        case 'name':
            break;

        case 'category':
            break;

        default:
            res.json(new NotImplementedError());
            return;
    }

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