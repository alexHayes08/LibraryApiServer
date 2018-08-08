import { Container } from 'inversify';

import { CronJobData } from './cronjob';
import { TYPES } from '../dependency-registrar';
import { LockService } from '../services/lock-service';
import { Paginate } from './paginate';
import { LockRecord } from './lock';

<<<<<<< HEAD
=======
function deleteOldRecord() {

}

>>>>>>> 8f5b85d1be355e6a118f99f4845690c18e406b49
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

            resolve(true);
        });
    }
};