/**
 * Used to 'reset' a RegExp object before using it. Pretty much just sets the
 * 'lastIndex' property to zero.
 * @param regex
 */
export function resetRegexExp(regex: RegExp): void {
    regex.lastIndex = 0;
}

/**
 * Only returns the matched groups of the regex. Normally calling
 * regexpression.exec(str) will return an array with the first element
 * being the full string matched and regexpression.exec(str) will need to be
 * called again to locate additional matches. This function will NOT return the
 * full string matched and will only return an array of ALL groups. It also
 * resets the regex expression so you don't have to reset the lastIndex back
 * to zero.
 * @param regex
 * @param str
 */
export function getAllGroups(regex: RegExp, str: string): string[][] {

    // Verify that the global flag is active, else this will not work
    if (!regex.global) {
        throw new Error('The global flag MUST be present.');
    }

    resetRegexExp(regex);
    const groups: string[][] = [];

    for (let group: RegExpExecArray|null = regex.exec(str)
       ; group != undefined
       ; group = regex.exec(str)
    ) {
        // Ignore first result, it's always the entire match not the groups.
        group.shift();
        groups.push(group);
    }

    resetRegexExp(regex);
    return groups;
}