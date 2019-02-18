import { Entity } from './entity';

export interface GenericRandomDataItem {
    usedRecently: boolean;
    data: object;
}

export interface RandomDataItemData extends Entity, GenericRandomDataItem { }

export class RandomDataItem implements RandomDataItemData {
    public id: string;
    public usedRecently: boolean;
    public data: object;

    public constructor(data: RandomDataItemData) {
        this.id = data.id;
        this.usedRecently = data.usedRecently;
        this.data = data.data;
    }
}

export interface GenericRandomData {
    group: string;
    items: GenericRandomDataItem[];
}

export interface RandomDataRecordData extends Entity, GenericRandomData { }

export class RandomData implements RandomDataRecordData {
    public id: string;
    public items: GenericRandomDataItem[];
    public group: string;

    public constructor(data: RandomDataRecordData) {
        this.id = data.id;
        this.items = data.items;
        this.group = data.group;
    }
}
