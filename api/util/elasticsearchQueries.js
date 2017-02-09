export const aggregateTermsQuery = {
    query : {
        terms : {tags : []}
    },
    size: 10,
    aggregations : {
        terms: {
            terms : {
                field : "tags.keyword",
                size: 50
            }
        },
        term_count: {
            value_count: {
                field: "tags.keyword"
            }
        }
    }
};

export const searchWithTermsQuery = {
    query : {
        terms : {
            tags : []
        }
    },
    size: 10
};