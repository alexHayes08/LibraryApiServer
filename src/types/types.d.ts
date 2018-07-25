import { Schema } from 'mongoose';

declare module "*.json" {
    const value: any;
    export default value;
}
