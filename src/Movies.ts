import axios from 'axios';
import Error from './Error';
import { api } from './Config';
import { info } from './Log';

const moviesAjax = axios.create({
    baseURL: api.baseUrl
});

export default class Movies {
    constructor() {
        info('Initialise Movies API.');
    }

    // Search for a movie from API by its title.
    async search(title = '', year?) {
        info(`Search for "${title}" from Movies API.`);

        let searchQuery = `?apikey=${api.key}&s=${title}`;

        if (year) {
            info(`Search for movies only from year ${year}.`);
            searchQuery += `&y=${year}`;
        }

        const { data } = await moviesAjax.get(searchQuery);
        if (data.Error) {
            throw data.Error;
        }

        return data.Search;
    }
}
