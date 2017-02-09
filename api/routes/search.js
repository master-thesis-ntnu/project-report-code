import SearchController from '../controllers/search';
import Router from 'express';

class Search {
    static getSearchRoutes() {
        let routes = Router();

        routes.get('/suggest', async (request, response) => {
            let queryTerms = request.query.query.split(' ');

            let expandQuery =
                (request.query.expand_query === 'true') ||
                (typeof request.query.expand_query === 'undefined');

            let results;
            try {
                if (expandQuery) {
                    results = await SearchController.queryExpandedSuggestion(queryTerms);
                } else {
                    results = await SearchController.suggestion(queryTerms);
                }
            } catch(error) {
                console.log(error);
            }

            response.status(200).send(results);
        });

        routes.post('/suggest', async (request, response) => {
            let queryTerms = request.body.query;//request.query.query.split(' ');

            let expandQuery =
                (request.query.expand_query === 'true') ||
                (typeof request.query.expand_query === 'undefined');

            let results;
            try {
                if (expandQuery) {
                    results = await SearchController.queryExpandedSuggestion(queryTerms);
                } else {
                    results = await SearchController.suggestion(queryTerms);
                }
            } catch(error) {
                console.log(error);
            }

            response.status(200).send(results);
        });

        return routes;
    }
}

export default Search;