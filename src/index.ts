import './styles.scss';
import Movies from './Movies';

// Initialises Movies API
const movies: Movies = new Movies();

// Remember references to the DOM elements used later
const resultsContainer = document.getElementById('search-results');
const detailsContainer = document.getElementById('movie-details');
const errorContainer = document.getElementById('error');

// Add listener to search button
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
searchButton.addEventListener('click', () => {
    updateSearchResults((searchInput as HTMLInputElement).value);
});

// Display error message to user
const displayError = (message: string) => {
    errorContainer.innerHTML = `<div>Error: ${message}</div>`;
};

// Load new search results and update the listing
const updateSearchResults = async (keyword: string) => {
    let results = [];

    try {
        results = await movies.search(keyword);
    } catch (error) {
        displayError(error);
    }

    // Add movie results one-by-one to the list
    results.forEach((movie) => {
        const movieContainer: HTMLElement = document.createElement('div');
        movieContainer.innerHTML = movie.Title;
        movieContainer.addEventListener('click', updateMovieDetails.bind(this, movie.imdbID));

        resultsContainer.appendChild(movieContainer);
    });
};

// Load detailed information about a movie by its IMDB ID
const updateMovieDetails = async (movieId: string) => {
    detailsContainer.innerHTML = `<div>Movie IMDB ID: ${movieId}</div>`;

    // Make an API request and return movie information.
    // E.g: http://www.omdbapi.com/?i=tt0465494&apikey=86e1fde4
};
