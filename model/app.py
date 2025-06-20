import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from difflib import get_close_matches
from tmdb_api import get_movie_data


# Normalize movie titles for better fuzzy matching
def normalize(title):
    return (
        title.lower()
        .replace(",", "")
        .replace(":", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
        .strip()
    )


# Load datasets
movies = pd.read_csv("data/ml-latest-small/movies.csv")
tags = pd.read_csv("data/ml-latest-small/tags.csv")
ratings = pd.read_csv("data/ml-latest-small/ratings.csv")
links = pd.read_csv("data/ml-latest-small/links.csv")

# Clean genres and combine with tags
movies["genres"] = movies["genres"].fillna("").apply(lambda x: x.replace("|", " "))
tag_data = tags.groupby("movieId")["tag"].apply(lambda x: " ".join(x)).reset_index()
movies = movies.merge(tag_data, on="movieId", how="left")
movies["tag"] = movies["tag"].fillna("")
movies["combined"] = movies["genres"] + " " + movies["tag"]

# Normalize titles
movies["normalized_title"] = movies["title"].apply(normalize)

# Merge average ratings
avg_ratings = ratings.groupby("movieId")["rating"].mean().reset_index()
avg_ratings.columns = ["movieId", "avg_ratings"]
movies = movies.merge(avg_ratings, on="movieId", how="left")

# Merge tmdbId
movies = movies.merge(links[["movieId", "tmdbId"]], on="movieId", how="left")
movies["tmdbId"] = movies["tmdbId"].fillna(0).astype(int)

# TF-IDF Vectorization and Cosine Similarity
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(movies["combined"])
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# Title-index map
indices = pd.Series(movies.index, index=movies["title"]).drop_duplicates()


# Get recommendations with fuzzy matching
def get_recommendations(title, cosine_sim=cosine_sim):
    clean_title = normalize(title)
    all_titles = movies["normalized_title"].tolist()
    match = get_close_matches(clean_title, all_titles, n=1, cutoff=0.5)

    if not match:
        print(f"❌ Movie '{title}' not found.")
        return None, pd.DataFrame()

    actual_title = movies[movies["normalized_title"] == match[0]]["title"].values[0]
    idx = indices[actual_title]
    sim_scores = sorted(
        list(enumerate(cosine_sim[idx])), key=lambda x: x[1], reverse=True
    )[1:6]
    movie_indices = [i[0] for i in sim_scores]
    return (
        actual_title,
        movies.iloc[movie_indices][["title", "genres", "avg_ratings", "tmdbId"]],
    )


# 🔍 Search & Display
user_input = "Titanic"  # Change this to test different inputs
actual_title, recommendations = get_recommendations(user_input)

if recommendations.empty:
    exit()

# 🎬 Show the searched movie
searched_row = movies[movies["title"] == actual_title].iloc[0]
print(f"\n🎬 You searched for: {actual_title}")
print(f"⭐ Average User Rating: {searched_row['avg_ratings']:.2f}")
print(f"🎯 Top 5 Similar Movie Recommendations:\n")

# 🎁 Show recommendations
for _, row in recommendations.iterrows():
    if row["tmdbId"] == 0:
        print(f"🎬 {row['title']}")
        print(f"⭐ Avg Rating: {row['avg_ratings']:.2f}")
        print("❌ TMDb data unavailable")
    else:
        data = get_movie_data(row["tmdbId"])
        print(f"🎬 {data['title']}")
        print(f"⭐ Avg Rating: {row['avg_ratings']:.2f}")
        print(f"⭐ TMDb Rating: {data['rating']}")
        print(f"🖼️ Poster: {data['poster']}")
    print("------")
