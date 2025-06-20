import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

# Load the dataset
df = pd.read_csv('data/ml-latest-small/movies.csv')

# Clean and combine genres
df['genres'] = df['genres'].fillna('').apply(lambda x: x.replace('|', ' '))
df['combined'] = df['genres']

# Vectorize the combined genre text
tfidf = TfidfVectorizer()
tfidf_matrix = tfidf.fit_transform(df['combined'])

# Compute cosine similarity
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# Map movie titles to indices
indices = pd.Series(df.index, index=df['title']).drop_duplicates()

# Recommendation function
def get_recommendations(title, cosine_sim=cosine_sim):
    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:6]
    movie_indices = [i[0] for i in sim_scores]
    return df['title'].iloc[movie_indices]

# Try a sample
print(get_recommendations('Toy Story (1995)'))