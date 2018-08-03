import { Container } from 'inversify';

import { CronJobData } from './cronjob';
import { TYPES } from '../dependency-registrar';
import { LockService } from '../services/lock-service';
import { PaginationResults, Paginate } from './paginate';
import { LockRecord } from './lock';
import { resolve } from 'url';

function executePromisesSequentially<T>(promises: Array<Promise<T>>): Promise<T> {
    return promises.reduce((p, f) => p.then(f), Promise.resolve());
}

export const deleteOldLockRecordsCronJob: CronJobData = {
    id: 'fed584f6-9d30-4dc8-9983-73cf4c965749',
    name: 'Delete Old Lock Records',
    every: '',
    run: function (container: Container): Promise<boolean> {
        return new Promise(async function (resolve, reject) {
            const lockRecordService = container
                .get<LockService>(TYPES.LockService);

            let nextResults: Paginate<LockRecord>|undefined = undefined;

            do {
                const results = await lockRecordService.paginate({
                    limit: 10
                });
                nextResults = results.next;
            } while (nextResults !== undefined);

            const iterator = generator();
            for await (const oldLocks of iterator) {
                console.log(oldLocks);
            }

            resolve(true);
        });
    }
};