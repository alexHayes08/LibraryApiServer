import { CrudPlusPattern } from './crud-plus-pattern';
import { UserData, User } from '../models/user';

export interface UserService extends CrudPlusPattern<User, UserData> { }