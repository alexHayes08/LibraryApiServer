export interface JwtToken {
    clientId: string;
    clientSecret: string;
}

export function isJwtToken(value): value is JwtToken {
    return value !== undefined
        && value.clientId !== undefined
        && value.clientSecret !== undefined;
}
