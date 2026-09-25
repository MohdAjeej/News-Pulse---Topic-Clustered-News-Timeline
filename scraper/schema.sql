-- Database schema for News Pulse

CREATE TABLE IF NOT EXISTS clusters (
    id SERIAL PRIMARY KEY,
    label VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    url VARCHAR(1000) UNIQUE NOT NULL,
    source VARCHAR(200) NOT NULL,
    headline VARCHAR(1000) NOT NULL,
    summary TEXT,
    body TEXT,
    published_at TIMESTAMP,
    cluster_id INTEGER REFERENCES clusters(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_cluster_id ON articles(cluster_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
