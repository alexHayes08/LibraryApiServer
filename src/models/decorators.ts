/**
 * This is still a work in progress, but the goal is to automate the index
 * creation for Firestore.
 */
const indexThese: string[] = [];

/**
 * Used to generate indicies for Firestore.
 */
export function index(target: any, propertyKey: string) {
    indexThese.push(propertyKey);
    console.log(indexThese);
}
