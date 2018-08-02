import { Container } from 'inversify';

import { CronJobData } from './cronjob';
import { TYPES } from '../dependency-registrar';
import { LockService } from '../services/lock-service';
import { PaginationResults, Paginate } from './paginate';
import { LockRecord } from './lock';

function executePromisesSequentially<T>(promises: Array<Promise<T>>): Promise<T> {
    return promises.reduce((p, f) => p.then(f), Promise.resolve());
}

export const deleteOldLockRecordsCronJob: CronJobData = {
    id: 'fed584f6-9d30-4dc8-9983-73cf4c965749',
    name: 'Delete Old Lock Records',
    every: '',
    run: async function (container: Container): Promise<boolean> {
        const lockRecordService = container
            .get<LockService>(TYPES.LockService);

        let nextResults: Paginate<LockRecord>|undefined = undefined;

        async function* generator() {
            lockRecordService.paginate({
                limit: 10
            }).then(results => {
                nextResults = results.next;
                yield results.results;
            });

            while (nextResults !== undefined) {
                const results = await lockRecordService.paginate(nextResults);
                nextResults = results.next;
                yield results.results;
            }
        }

        do {
            const results = lockRecordService.paginate({
                limit: 10
            });
        } while (nextResults !== undefined);

        const iterator = generator();
        const lockRecords = Array.from(iterator);
        for await (const oldLocks of iterator) {
            console.log(oldLocks);
        }

        return Promise.resolve(true);
    }
};