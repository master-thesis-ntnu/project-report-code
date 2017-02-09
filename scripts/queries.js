
export function getFetchTagsQuery(numberOfTagsToReturn) {
    let query = {
        size: 0,
        aggs : {
            term_buckets: {
                terms: {
                    field: "tags.keyword",
                    size: numberOfTagsToReturn
                }
            }
        }
    };

    return JSON.stringify(query);
}