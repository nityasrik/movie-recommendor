import pandas as pd
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from difflib import get_close_matches
import os

OMDB_API_KEY = "80ae224"

app = Flask(__name__)
CORS(app)

# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load data using absolute paths
movies_path = os.path.join(script_dir, "data/ml-latest-small/movies.csv")
links_path = os.path.join(script_dir, "data/ml-latest-small/links.csv")
tags_path = os.path.join(script_dir, "data/ml-latest-small/tags.csv")
ratings_path = os.path.join(script_dir, "data/ml-latest-small/ratings.csv")

movies = pd.read_csv(movies_path)
links = pd.read_csv(links_path)
tags = pd.read_csv(tags_path)
ratings = pd.read_csv(ratings_path)

# Preprocess
movies["genres"] = movies["genres"].fillna("").str.replace("|", " ", regex=False)
tag_data = tags.groupby("movieId")["tag"].apply(lambda x: " ".join(x)).reset_index()
movies = movies.merge(tag_data, on="movieId", how="left")
movies["tag"] = movies["tag"].fillna("")
movies["combined"] = movies["genres"] + " " + movies["tag"]

# Content-based filtering
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(movies["combined"])
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
indices = pd.Series(movies.index, index=movies["title"]).drop_duplicates()

def get_omdb_poster(imdb_id):
    if pd.isna(imdb_id):
        return "/fallback.jpg"
    url = f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}&i=tt{str(imdb_id).zfill(7)}"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if data.get("Response") == "True" and data.get("Poster") and data["Poster"] != "N/A":
            return data["Poster"]
    except Exception as e:
        print(f"[OMDb ERROR] {e}")
    return "/fallback.jpg"

def get_recommendations(title):
    all_titles = movies["title"].tolist()
    match = get_close_matches(title, all_titles, n=1, cutoff=0.5)
    if not match:
        return None, []
    idx = indices[match[0]]
    sim_scores = sorted(list(enumerate(cosine_sim[idx])), key=lambda x: x[1], reverse=True)[1:11]
    movie_indices = [i[0] for i in sim_scores]
    recs = []
    for i in movie_indices:
        row = movies.iloc[i]
        link = links[links["movieId"] == row["movieId"]]
        imdb_id = link["imdbId"].values[0] if not link.empty else None
        poster = get_omdb_poster(imdb_id)
        recs.append({
            "id": int(row["movieId"]),
            "title": row["title"],
            "genres": row["genres"],
            "poster": poster
        })
    return match[0], recs

@app.route("/recommend", methods=["GET"])
def recommend():
    title = request.args.get("movie_name")
    if not title:
        return jsonify({"error": "No movie title provided."}), 400
    actual_title, recommendations = get_recommendations(title)
    if not recommendations:
        return jsonify({"error": "Movie not found."}), 404
    return jsonify({
        "searched": actual_title,
        "recommendations": recommendations
    })

if __name__ == "__main__":
    app.run(debug=True, port=8000)
