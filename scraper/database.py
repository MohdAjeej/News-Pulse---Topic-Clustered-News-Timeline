"""Database operations for News Pulse scraper."""
import psycopg2
from psycopg2.extras import RealDictCursor
from config import DATABASE_URL


class Database:
    """Database connection and operations manager."""
    
    def __init__(self):
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Establish database connection."""
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        print("✓ Database connected")
    
    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("✓ Database connection closed")
    
    def init_schema(self):
        """Initialize database schema if not exists."""
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
        
        self.cursor.execute(schema_sql)
        self.conn.commit()
        print("✓ Database schema initialized")
    
    def insert_article(self, article_data):
        """
        Insert article into database.
        Returns the article ID if inserted, None if duplicate (ON CONFLICT).
        """
        query = """
            INSERT INTO articles (url, source, headline, summary, body, published_at)
            VALUES (%(url)s, %(source)s, %(headline)s, %(summary)s, %(body)s, %(published_at)s)
            ON CONFLICT (url) DO NOTHING
            RETURNING id
        """
        self.cursor.execute(query, article_data)
        result = self.cursor.fetchone()
        self.conn.commit()
        return result['id'] if result else None
    
    def get_unclustered_articles(self):
        """Get all articles that haven't been assigned to a cluster yet."""
        query = """
            SELECT id, url, source, headline, summary, body, published_at
            FROM articles
            WHERE cluster_id IS NULL
            ORDER BY published_at DESC NULLS LAST
        """
        self.cursor.execute(query)
        return self.cursor.fetchall()
    
    def get_all_articles(self):
        """Get all articles for clustering."""
        query = """
            SELECT id, url, source, headline, summary, body, published_at, cluster_id
            FROM articles
            ORDER BY published_at DESC NULLS LAST
        """
        self.cursor.execute(query)
        return self.cursor.fetchall()
    
    def create_cluster(self, label):
        """Create a new cluster and return its ID."""
        query = """
            INSERT INTO clusters (label)
            VALUES (%s)
            RETURNING id
        """
        self.cursor.execute(query, (label,))
        cluster_id = self.cursor.fetchone()['id']
        self.conn.commit()
        return cluster_id
    
    def assign_articles_to_cluster(self, article_ids, cluster_id):
        """Assign multiple articles to a cluster."""
        query = """
            UPDATE articles
            SET cluster_id = %s
            WHERE id = ANY(%s)
        """
        self.cursor.execute(query, (cluster_id, article_ids))
        self.conn.commit()
    
    def get_existing_clusters(self):
        """Get all existing clusters with their articles."""
        query = """
            SELECT 
                c.id,
                c.label,
                array_agg(a.id) as article_ids,
                array_agg(a.headline) as headlines,
                array_agg(a.summary) as summaries
            FROM clusters c
            LEFT JOIN articles a ON c.id = a.cluster_id
            GROUP BY c.id, c.label
        """
        self.cursor.execute(query)
        return self.cursor.fetchall()
