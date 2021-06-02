import './styles.scss';
import Movies, { moviesAjax } from './Movies';
import { api } from './Config';
import axios from 'axios';

export interface IMovie {
    Title: string,
    imdbId: string,
    [key:string]: string 
}

// Store search results
let movieResultCache: IMovie[] = [];
let searchPhraseCache: string[] = [];

// Initialises Movies API
const movies: Movies = new Movies();

// Remember references to the DOM elements used later
const resultsContainer = document.getElementById('search-results');
const detailsContainer = document.getElementById('movie-details');
const errorContainer = document.getElementById('error');

const searchButton = document.getElementById('search-button');
const searchTitle = document.getElementById('search-title');
const searchYear = document.getElementById('search-year');

// Use handle to reset timeout
let handleTimeout;

function invokeTimeout(title: string, year?: string) {
    handleTimeout = window.setTimeout(function() { 
        updateSearchResults(title, year) 
    }, 300);
}

// Add listener to search button
searchButton.addEventListener('click', () => {
    const inputTitle = (searchTitle as HTMLInputElement).value;
    const inputYear = (searchYear as HTMLInputElement)?.value;
    if(!!inputTitle.length) {
        updateSearchResults(inputTitle, inputYear) 
    } else {
        displayError('Please enter a title keyword')
    }
});

// Add listeners to search boxes
searchTitle.addEventListener('keyup', () => {
    const inputTitle = (searchTitle as HTMLInputElement).value;
    window.clearTimeout(handleTimeout);
    if(inputTitle.length >= 3) {
        invokeTimeout(inputTitle);
    }
})

searchYear.addEventListener('keyup', () => {
    const inputTitle = (searchTitle as HTMLInputElement).value;
    const inputYear = (searchYear as HTMLInputElement)?.value;

    window.clearTimeout(handleTimeout);
    if(inputYear.length >= 3 && inputTitle.length >= 3) {
        invokeTimeout(inputTitle, inputYear);
    }
})

// Display error message to user
const displayError = (message: string) => {
    errorContainer.innerHTML = `<div>Error: ${message}</div>`;
    setTimeout(function() { 
       errorContainer.innerHTML = ''; 
    }, 3000);
};

// Clear results list and details
const removeOldResults = () => {
    if(resultsContainer.hasChildNodes) {
        while(!!resultsContainer.firstChild) {
            resultsContainer.removeChild(resultsContainer.firstChild);
        }
    }
    if(detailsContainer.hasChildNodes) {
        while(!!detailsContainer.firstChild) {
            detailsContainer.removeChild(detailsContainer.firstChild);
        }
    }
    return;
}

const getMovieList = async (keyword: string, year?: string) => {

    const isSearchCached: boolean = !!searchPhraseCache.find( (s: string) => s.toUpperCase() === keyword.toUpperCase());
    const isSearchByYear: boolean = !!keyword && !!year && filterMovies(keyword, year).length < 10;

    if( (!isSearchCached || isSearchByYear ) && !!keyword) {
        if(!isSearchCached) {
            searchPhraseCache.push(keyword);
        }
        try {
            movieResultCache = [].concat(...movieResultCache, await movies.search(keyword, year));
        } catch (error) {
            displayError(error);
        }
    } 
    return
}

const filterMovies = (keyword: string, year?: string) => {

    const regex = new RegExp(`${keyword}`, 'i')

    return movieResultCache.filter( ({Title, Year}) => !!year
        ? year === Year && regex.test(Title)
        : regex.test(Title)
    ).slice(0, 10).sort((a, b) => a.Title.localeCompare(b.Title));;
}

const displayNewResults = (keyword: string, year?: string) => {

    const displayMovieList = filterMovies(keyword, year);

    // Add movie results one-by-one to the list
    displayMovieList?.forEach((movie: IMovie) => {
        const movieContainer: HTMLElement = document.createElement('div');
        movieContainer.className = 'search-results-item';
        movieContainer.innerHTML = movie.Title;
        movieContainer.addEventListener('click', updateMovieDetails.bind(this, movie.imdbID));
        resultsContainer.appendChild(movieContainer);
    });
}

// Load detailed information about a movie by its IMDB ID
const updateMovieDetails = async (movieId: string) => {

    let searchQuery = `?apikey=${api.key}&i=${movieId}&type=movie&plot=full`;
    const { data } = await moviesAjax.get(searchQuery); 
       
    if (data.Error) {
        throw data.Error;
    }

    const countUnique = (data?.Plot as string).match(/(\w+)(?![\s\S]*\1)/gi).length;
    detailsContainer.innerHTML = `<div>Title: ${data.Title}</div><div>Plot: ${data.Plot}</div><div>Unique words: ${countUnique}</div>`;
    // Make an API request and return movie information.
    // E.g: http://www.omdbapi.com/?i=tt0465494&apikey=86e1fde4
};

// Load new search results and update the listing
const updateSearchResults = async (keyword: string, year?: string) => {
    console.log('click')
    removeOldResults();
    await getMovieList(keyword, year);
    displayNewResults(keyword, year);
};


