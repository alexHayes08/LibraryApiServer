import { CronJobData, GenericCronJob } from '../models/cronjob';
import { CrudPlusPattern } from './crud-plus-pattern';

export interface CronJobService extends CrudPlusPattern<GenericCronJob, CronJobData> {
    scheduleJob(cronJob: CronJobData): Promise<boolean>;
    unscheduleJob(cronJob: CronJobData): Promise<boolean>;
    runJobNow(cronJob: CronJobData): Promise<boolean>;
    isJobRunning(cronJob: CronJobData): Promise<boolean>;
}