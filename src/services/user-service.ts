import { CrudPlusPattern } from './crud-plus-pattern';
import { UserData, GenericUserData, User } from '../models/user';

export interface UserService extends CrudPlusPattern<User, UserData, GenericUserData> { }