import Router from 'express';
import Search from './search';

class Routes {
    static getApiRoutes() {
        let api = Router();

        api.use('/search', Search.getSearchRoutes());

        return api;
    }
}

export default Routes;