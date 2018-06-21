import { CrudPlusPattern } from './crud-plus-pattern';
import { UserData, GenericUserInfo, User } from '../models/user';

export interface UserService extends CrudPlusPattern<UserData> {
    create(user: User|GenericUserInfo): Promise<User>;
}