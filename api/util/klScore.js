class KLScore {
    static calculateKlScore(termBuckets, tagsFromInitialSearch, numberOfTermsInTopKDocuments, totalNumberOfTermsInCollection) {
        let termScores = [];

        // Calculate KL Score for each term
        for(let term of Object.keys(tagsFromInitialSearch)) {
            let totalNumberOfTimesInCollection = termBuckets[term];

            // Skip values which is not significant
            if(typeof totalNumberOfTimesInCollection === 'undefined') {
                continue;
            }

            let termScore = KLScore.klScore(
                tagsFromInitialSearch[term],
                numberOfTermsInTopKDocuments,
                termBuckets[term].doc_count,
                totalNumberOfTermsInCollection
            );

            /*console.log('Term: ' + term);
            console.log('Number of times in top k: ' + tagsFromInitialSearch[term]);
            console.log('Number of terms in top k: ' + numberOfTermsInTopKDocuments);
            console.log('Number of times in collection: ' + termBuckets[term].doc_count);
            console.log('Number of terms in collection: ' + totalNumberOfTermsInCollection);*/

            let newTermObject = {
                klScore: termScore,
                term: term
            };

            termScores.push(newTermObject);
        }
        console.log(termScores);

        return termScores;
    }

    /**
     * Calculates Kullback-Leibler divergence score for a term. Top-k documents, are all the documents returned by
     * Elasticsearch from a given query.
     *
     * @param numberOfTimesInTopKDocuments number of times a term appears in top-k documents
     * @param numberOfTermsInTopKDocuments total number of terms in top-k documents
     * @param totalNumberOfTimesInCollection number of times a term appears in the whole collection
     * @param totalNumberOfTermsInCollection total number of terms in the whole collection
     *
     * @returns {Number}
     */
    static klScore(numberOfTimesInTopKDocuments, numberOfTermsInTopKDocuments, totalNumberOfTimesInCollection, totalNumberOfTermsInCollection) {
        let prel = numberOfTimesInTopKDocuments / numberOfTermsInTopKDocuments;
        let pcol = totalNumberOfTimesInCollection / totalNumberOfTermsInCollection;

        return prel * Math.log(prel / pcol);
    }
}

export default KLScore;