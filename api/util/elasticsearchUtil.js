import Elasticsearch from 'elasticsearch';
import {aggregateTermsQuery, searchWithTermsQuery} from './elasticsearchQueries';

const HOST = 'localhost:9200';
const INDEX = 'photos';
const TYPE = 'photo';

const elasticsearch = new Elasticsearch.Client({
    host: HOST
});

class ElasticsearchUtil {
    static getAggregatedTerms(queryTerms) {
        // Add queryTerms to the query
        let query = JSON.parse(JSON.stringify(aggregateTermsQuery));
        query.query.terms.tags = queryTerms;

        return elasticsearch.search({
            index: INDEX,
            type: TYPE,
            body: query
        })
    }

    static getPhotosByHashtagTerms(queryTerms) {
        // Add queryTerms to the query
        let query = JSON.parse(JSON.stringify(searchWithTermsQuery));
        query.query.terms.tags = queryTerms;

        return elasticsearch.search({
            index: INDEX,
            type: TYPE,
            body: query
        })
    }
}

export default ElasticsearchUtil;