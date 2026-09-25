"""RSS feed fetching and article extraction."""
import feedparser
import trafilatura
from datetime import datetime
from dateutil import parser as date_parser
import time


class ArticleFetcher:
    """Handles RSS feed parsing and article content extraction."""
    
    def __init__(self, feeds):
        self.feeds = feeds
    
    def fetch_all(self):
        """Fetch articles from all configured RSS feeds."""
        all_articles = []
        
        for feed_config in self.feeds:
            print(f"\n📡 Fetching from {feed_config['source']}...")
            articles = self._fetch_feed(feed_config)
            all_articles.extend(articles)
            print(f"   → Found {len(articles)} articles")
            time.sleep(1)  # Be nice to servers
        
        print(f"\n✓ Total articles fetched: {len(all_articles)}")
        return all_articles
    
    def _fetch_feed(self, feed_config):
        """Fetch and parse a single RSS feed."""
        try:
            feed = feedparser.parse(feed_config['url'])
            
            if feed.bozo:
                print(f"   ⚠ Feed parsing warning: {feed.bozo_exception}")
            
            articles = []
            for entry in feed.entries:
                article = self._normalize_entry(entry, feed_config['source'])
                if article:
                    articles.append(article)
            
            return articles
        
        except Exception as e:
            print(f"   ✗ Error fetching feed {feed_config['source']}: {e}")
            return []
    
    def _normalize_entry(self, entry, source):
        """
        Normalize RSS entry into consistent schema.
        Handles various feed format inconsistencies.
        """
        try:
            # Extract URL
            url = entry.get('link', entry.get('id', ''))
            if not url:
                return None
            
            # Extract headline
            headline = entry.get('title', 'No title')
            
            # Extract summary - try multiple possible fields
            summary = (
                entry.get('summary', '') or
                entry.get('description', '') or
                entry.get('content', [{}])[0].get('value', '') if entry.get('content') else ''
            )
            
            # Extract and normalize published date
            published_at = self._parse_published_date(entry)
            
            return {
                'url': url,
                'source': source,
                'headline': headline,
                'summary': summary[:5000] if summary else '',  # Limit summary length
                'published_at': published_at,
                'body': None  # Will be extracted separately
            }
        
        except Exception as e:
            print(f"   ⚠ Error normalizing entry: {e}")
            return None
    
    def _parse_published_date(self, entry):
        """
        Parse published date from entry with fallback handling.
        Returns datetime object or None.
        """
        # Try various date fields
        date_fields = ['published', 'pubDate', 'updated', 'created']
        
        for field in date_fields:
            date_str = entry.get(field)
            if date_str:
                try:
                    # Try parsing with dateutil (handles most formats)
                    return date_parser.parse(date_str)
                except:
                    pass
                
                # Try feedparser's parsed time
                parsed_field = f"{field}_parsed"
                if hasattr(entry, parsed_field):
                    time_struct = getattr(entry, parsed_field)
                    if time_struct:
                        try:
                            return datetime(*time_struct[:6])
                        except:
                            pass
        
        # Fallback: use current time if no date found
        # This is documented behavior for feeds without dates
        return datetime.utcnow()
    
    def extract_full_text(self, url):
        """
        Extract full article body from URL using trafilatura.
        Returns body text or None if extraction fails.
        """
        try:
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return None
            
            text = trafilatura.extract(downloaded)
            return text
        
        except Exception as e:
            # Log but don't crash - some pages will fail
            print(f"   ⚠ Failed to extract text from {url[:50]}...: {e}")
            return None
