# tmdb_api.py
import requests

API_KEY = "0de49078da07cef338674345b75e9372"  # 🔑 Replace this
BASE_URL = "https://api.themoviedb.org/3"


def get_movie_data(tmdb_id):
    try:
        url = f"{BASE_URL}/movie/{tmdb_id}?api_key={API_KEY}"
        response = requests.get(url)
        movie = response.json()

        return {
            "title": movie.get("title", "N/A"),
            "rating": movie.get("vote_average", "N/A"),
            "poster": (
                f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
                if movie.get("poster_path")
                else "Not Found"
            ),
        }

    except Exception:
        return {"title": "N/A", "rating": "N/A", "poster": "Not Found"}
