#!/usr/bin/env python3
"""
News Pulse Scraper - Main entry point
Fetches articles from RSS feeds, extracts full text, and clusters by topic.
"""
import sys
from database import Database
from fetcher import ArticleFetcher
from clusterer import ArticleClusterer
from config import RSS_FEEDS


def main():
    """Main scraping and clustering pipeline."""
    db = Database()
    
    try:
        print("=" * 60)
        print("NEWS PULSE - RSS Scraper & Topic Clusterer")
        print("=" * 60)
        
        # Connect to database
        db.connect()
        db.init_schema()
        
        # Step 1: Fetch articles from RSS feeds
        print("\n" + "=" * 60)
        print("STEP 1: Fetching articles from RSS feeds")
        print("=" * 60)
        
        fetcher = ArticleFetcher(RSS_FEEDS)
        articles = fetcher.fetch_all()
        
        if not articles:
            print("\n⚠ No articles fetched. Exiting.")
            return 0
        
        # Step 2: Extract full article text and insert into database
        print("\n" + "=" * 60)
        print("STEP 2: Extracting full article text")
        print("=" * 60)
        
        new_articles_count = 0
        for i, article in enumerate(articles, 1):
            print(f"[{i}/{len(articles)}] Processing: {article['headline'][:60]}...")
            
            # Extract full article body
            body = fetcher.extract_full_text(article['url'])
            article['body'] = body
            
            # Insert into database (will skip if duplicate URL)
            article_id = db.insert_article(article)
            if article_id:
                new_articles_count += 1
        
        print(f"\n✓ Inserted {new_articles_count} new articles (skipped {len(articles) - new_articles_count} duplicates)")
        
        # Step 3: Cluster all articles
        print("\n" + "=" * 60)
        print("STEP 3: Clustering articles by topic")
        print("=" * 60)
        
        # Get all articles for clustering (including previously stored ones)
        all_articles = db.get_all_articles()
        
        if not all_articles:
            print("\n⚠ No articles in database to cluster. Exiting.")
            return 0
        
        # Perform clustering
        clusterer = ArticleClusterer()
        clusters = clusterer.cluster_articles(all_articles)
        
        # Clear existing cluster assignments and create new clusters
        print("\n📊 Updating cluster assignments...")
        
        # Clear existing clusters (we re-cluster all articles each time)
        db.cursor.execute("UPDATE articles SET cluster_id = NULL")
        db.cursor.execute("DELETE FROM clusters")
        db.conn.commit()
        
        # Create new clusters
        for cluster in clusters:
            cluster_id = db.create_cluster(cluster['label'])
            db.assign_articles_to_cluster(cluster['article_ids'], cluster_id)
            print(f"   • Cluster '{cluster['label']}': {len(cluster['article_ids'])} articles")
        
        print("\n" + "=" * 60)
        print("✓ COMPLETE")
        print("=" * 60)
        print(f"Total articles: {len(all_articles)}")
        print(f"New articles: {new_articles_count}")
        print(f"Total clusters: {len(clusters)}")
        print("=" * 60)
        
        return 0
    
    except Exception as e:
        print(f"\n✗ ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    
    finally:
        db.close()


if __name__ == '__main__':
    sys.exit(main())
