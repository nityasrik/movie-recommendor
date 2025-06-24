const WATCHLIST_KEY = "movie-recommender-watchlist";

export function getWatchlist() {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
}

export function addToWatchlist(movie) {
    const watchlist = getWatchlist();
    if (!watchlist.some((m) => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    }
}

export function removeFromWatchlist(id) {
    let watchlist = getWatchlist();
    watchlist = watchlist.filter((m) => m.id !== id);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
} 