export interface Updatable<T> {
    update(): Promise<T>;
}