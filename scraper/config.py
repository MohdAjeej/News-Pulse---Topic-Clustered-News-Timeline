"""Configuration for News Pulse scraper."""
import os
from dotenv import load_dotenv

load_dotenv()

# RSS Feeds configuration
RSS_FEEDS = [
    {
        'url': 'http://feeds.bbci.co.uk/news/rss.xml',
        'source': 'BBC News'
    },
    {
        'url': 'https://feeds.npr.org/1001/rss.xml',
        'source': 'NPR'
    },
    {
        'url': 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
        'source': 'The New York Times'
    }
]

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Clustering configuration
# Threshold: number of significant shared words to consider articles related
# Starting at 4 based on empirical testing - higher values create tighter clusters
# but may fragment related stories; lower values may over-cluster unrelated news.
CLUSTERING_THRESHOLD = int(os.getenv('CLUSTERING_THRESHOLD', '4'))

# Stopwords - common English words to ignore in clustering
STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'that', 'this', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'them', 'their', 'what',
    'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about',
    'after', 'also', 'any', 'because', 'before', 'between', 'into', 'through',
    'during', 'up', 'down', 'out', 'over', 'under', 'again', 'then', 'once',
    'here', 'there', 'all', 'says', 'said'
}
