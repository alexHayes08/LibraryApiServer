export function errorToObj(error: Error) {
    return {
        name: error.name,
        message: error.message
    };
}