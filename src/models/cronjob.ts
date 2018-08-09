import { Container } from 'inversify';

import { Entity } from './entity';

export interface CronJobData extends Entity {
    name: string;
    run: (container: Container) => void;
    every?: Date|string;
}

export interface GenericCronJob extends CronJobData {
    lastStarted: Date;
    lastEndDate: Date;
    lastSuccessfulEndDate: Date;
}
