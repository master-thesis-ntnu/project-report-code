export function removeUndescoreFromKeyName(dataString) {
    return dataString.replace(/_content/g, 'content');

}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Convert array to url string. E.g
 * [term1, term2, term3] -> 'term1+term2+term3'
 * @param array
 * @returns String
 */
export function termArrayToUrlString(array) {
    let urlString = '';

    for (let term of array) {
        urlString += term + '+';
    }

    // remove last '+' sign
    return urlString.slice(0, -1);
}