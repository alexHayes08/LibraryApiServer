import { CronJobService } from './cronjob-service';
import { CronJobData, GenericCronJob } from '../models/cronjob';
import { MongoCrudPlusPattern } from './mongo-crud-plus-pattern';
import { CronJobModel } from '../config/mongoose.config';
import { Document } from 'mongoose';

function documentToModel(doc: Document): GenericCronJob {
    return doc.toObject({
        virtuals: true,
        getters: true
    });
}

export class MongoCronJobService extends MongoCrudPlusPattern<GenericCronJob, CronJobData> implements CronJobService {
    //#region Constructor

    public constructor() {
        super(CronJobModel, documentToModel);
    }

    //#endregion

    //#region Methods

    scheduleJob(cronJob: CronJobData): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            reject(new Error('Not implemented'));
        });
    }

    unscheduleJob(cronJon: CronJobData): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            reject(new Error('Not implemented'));
        });
    }

    runJobNow(cronJob: CronJobData): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            reject(new Error('Not implemented'));
        });
    }

    isJobRunning(cronJob: CronJobData): Promise<boolean> {
        return new Promise(function(resolve, reject) {
            reject(new Error('Not implemented'));
        });
    }

    //#endregion
}