import Elasticsearch from '../util/elasticsearchUtil';
import KLScore from '../util/klScore';
import _ from 'lodash';
import Tag from '../util/tag';

const totalNumberOfTags = 298962;

class Search {
    static async queryExpandedSuggestion(originalQueryTerms) {
        // Fetch initial search result
        let searchResults = await Elasticsearch.getAggregatedTerms(originalQueryTerms);

        // Get all aggregated terms and convert it to a dictionary
        let termBuckets = searchResults.aggregations.terms.buckets;
        termBuckets = Search.elasticsearchResultArrayToDictionary(termBuckets);

        // Create a dictionary with count for each tag
        let photos = searchResults.hits.hits;
        let { tagsFromInitialSearch, totalNumberOfTermsInTopKDocuments } = Tag.generateTagCountsFromPhotos(photos);

        // Calculate the KL score
        let klScores = KLScore.calculateKlScore(termBuckets, tagsFromInitialSearch, totalNumberOfTermsInTopKDocuments, totalNumberOfTags);
        klScores = Search.orderByKlScore(klScores);

        // Expand query with the new terms
        let expandedQueryTerms = Search.expandQuery(originalQueryTerms, klScores);

        // Send last request with the new terms
        return await Elasticsearch.getPhotosByHashtagTerms(expandedQueryTerms);
    }

    static async suggestion(queryTerms) {
        return await Elasticsearch.getPhotosByHashtagTerms(queryTerms);
    }

    static orderByKlScore(klScores){
        return _.orderBy(klScores, ['klScore'], ['desc']);
    }

    /**
     * Convert aggregated result array from Elasticsearch to a dictionary
     * @param termBuckets
     */
    static elasticsearchResultArrayToDictionary(termBuckets) {
        return _.keyBy(termBuckets, 'key');
    }

    static expandQuery(originalQueryTerms, termsWithKlScore) {
        let newQueryTerms = originalQueryTerms;

        for (let newQueryTerm of termsWithKlScore) {
            if (newQueryTerms.indexOf(newQueryTerm) > -1) {
                continue;
            }

            // Only use a maximum of 10 terms
            if(newQueryTerms.length >= 10) {
                break;
            }

            newQueryTerms.push(newQueryTerm.term);
        }

        return newQueryTerms;
    }

}

export default Search;