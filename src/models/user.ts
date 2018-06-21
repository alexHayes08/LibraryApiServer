import { FirestoreData, index } from '../helpers/firestore-data-annotations';

export interface GenericUserInfo {
    associatedEmails: string[];
    name: string;
}

export interface UserData {
    id: string;
    associatedEmails: string[];
    name: string;
}

export class User extends FirestoreData implements UserData {
    //#region Fields

    @index()
    public id: string;

    public associatedEmails: string[];
    public name: string;

    //#endregion

    //#region Constructor

    constructor(data: UserData) {
        super();
        this.id = data.id;
        this.associatedEmails = data.associatedEmails;
        this.name = data.name;
    }

    //#endregion
}

export function isGenericUserInfo(value: any): value is GenericUserInfo {
    return value !== undefined
        && value.associatedEmails !== undefined
        && value.name !== undefined;
}

export function isUserData(value: any): value is UserData {
    return value !== undefined
        && value.id !== undefined
        && value.associatedEmails !== undefined
        && value.name !== undefined;
}