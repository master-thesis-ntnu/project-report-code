import fetch from 'node-fetch';
import { getFetchTagsQuery } from './queries';
import { getRandomInt } from './utilFunctions';

const baseUrl = 'http://localhost:8080/api/search/suggest?expand_query=false';
const tagsUrl = 'http://localhost:9200/photos/_search';
const numberOfRequestRounds = 200;
const numberOfParallelRequests = 50;
const numberOfTags = 1000;

function sendRequests(numberOfParallelRequests, termsArray) {
    let urlArray = createUrlArray(numberOfParallelRequests, termsArray);

    return Promise.all(urlArray.map((query) => {
        //console.log(query);

        return fetch(baseUrl, {method: 'POST', body: query, headers: { 'Content-Type': 'application/json' }}).then((response) => {
            return response.text();
        }).catch((error) => {
            console.log(error);
        });
    }));
}

function createUrlArray(numberOfParallelRequests, termsArray) {
    let queryTerms = [];

    for (let i = 0; i < numberOfParallelRequests; i++) {
        let randomTerms = termsArray[getRandomInt(0, termsArray.length)];

        let query = {
            query: randomTerms
        };

        queryTerms.push(JSON.stringify(query));
    }

    return queryTerms;
}

function fetchTags(numberOfTags) {
    let query = getFetchTagsQuery(numberOfTags);

    return fetch(tagsUrl, {method: 'POST', body: query}).then((response) => {
        return response.json();
    });
}

function createTermsArrayFromElasticsearchResult(resultFromElasticsearch, numberOfTermArrays) {
    let termsArray = [];
    let tags = resultFromElasticsearch.aggregations.term_buckets.buckets;
    let numberOfTags = tags.length;

    for (let i = 0; i < numberOfTermArrays; i++) {
        let terms = [];
        let numberOfTerms = getRandomInt(1, 6);

        for (let j = 0; j < numberOfTerms; j++) {
            let term = tags[getRandomInt(0, numberOfTags)].key;

            terms.push(term);
        }

        termsArray.push(terms);
    }

    return termsArray;
}

async function createTermsArray() {
    let elasticsearchResponse;
    let terms;

    elasticsearchResponse = await fetchTags(numberOfTags);
    terms = createTermsArrayFromElasticsearchResult(elasticsearchResponse, numberOfRequestRounds);

    return terms;
}

let totalRequests = 0;
async function main() {
    console.log('Fetching tags...');
    let termsArray = await createTermsArray(numberOfTags);
    console.log('Tags fetched');

    console.log('Sending requests...');
    try {
        for (let i = 0; i < numberOfRequestRounds; i++) {
            await sendRequests(numberOfParallelRequests, termsArray);

            totalRequests += numberOfParallelRequests;
            if (totalRequests % 1000 == 0) {
                console.log('Sent so far: ' + totalRequests);
            }
        }
    } catch (error) {
        console.log(error);
    }
}

main();