"""Article clustering using keyword/word-overlap approach."""
import re
from collections import Counter
from config import STOPWORDS, CLUSTERING_THRESHOLD


class ArticleClusterer:
    """
    Groups articles into topic clusters using keyword overlap.
    
    Approach: Keyword/word-overlap grouping
    - Extract meaningful words from headlines and summaries
    - Compare articles by shared significant words
    - Group articles that exceed a threshold of shared words
    - Label clusters with their most common shared terms
    
    Threshold choice (default=4):
    - Based on empirical observation: 4+ shared meaningful words typically
      indicates same topic (e.g., "election", "senate", "vote", "bill")
    - Lower values (2-3) risk grouping unrelated stories with coincidental overlap
    - Higher values (5+) fragment related coverage across outlets
    - Tunable via CLUSTERING_THRESHOLD environment variable
    
    Known limitations:
    - Does not detect semantic similarity (e.g., "car" vs "automobile")
    - Struggles with stories using different terminology for same event
    - May split multi-faceted stories into separate clusters
    - No cross-source story merging (same event from different outlets)
    """
    
    def __init__(self, threshold=CLUSTERING_THRESHOLD):
        self.threshold = threshold
        self.stopwords = STOPWORDS
    
    def cluster_articles(self, articles):
        """
        Group articles into clusters based on keyword overlap.
        Returns list of clusters: [{label, article_ids}]
        """
        if not articles:
            return []
        
        print(f"\n🔍 Clustering {len(articles)} articles (threshold={self.threshold})...")
        
        # Extract keywords for each article
        article_keywords = []
        for article in articles:
            keywords = self._extract_keywords(article)
            article_keywords.append({
                'id': article['id'],
                'keywords': keywords,
                'headline': article['headline']
            })
        
        # Group articles into clusters
        clusters = []
        used_article_ids = set()
        
        for i, article_data in enumerate(article_keywords):
            if article_data['id'] in used_article_ids:
                continue
            
            # Start a new cluster with this article
            cluster_keywords = article_data['keywords'].copy()
            cluster_article_ids = [article_data['id']]
            used_article_ids.add(article_data['id'])
            
            # Find related articles
            for j, other_data in enumerate(article_keywords):
                if i >= j or other_data['id'] in used_article_ids:
                    continue
                
                # Calculate overlap
                shared_words = cluster_keywords & other_data['keywords']
                
                if len(shared_words) >= self.threshold:
                    # Add to cluster
                    cluster_article_ids.append(other_data['id'])
                    used_article_ids.add(other_data['id'])
                    # Update cluster keywords (union)
                    cluster_keywords.update(other_data['keywords'])
            
            # Create cluster label from most common keywords
            label = self._generate_cluster_label(cluster_keywords, article_keywords, cluster_article_ids)
            
            clusters.append({
                'label': label,
                'article_ids': cluster_article_ids
            })
        
        print(f"✓ Created {len(clusters)} clusters")
        return clusters
    
    def _extract_keywords(self, article):
        """
        Extract meaningful keywords from article headline and summary.
        Returns set of lowercased keywords with stopwords removed.
        """
        # Combine headline and summary
        text = f"{article['headline']} {article.get('summary', '')}"
        
        # Lowercase and extract words (alphanumeric only)
        words = re.findall(r'\b[a-z]+\b', text.lower())
        
        # Filter out stopwords and short words
        keywords = {
            word for word in words 
            if word not in self.stopwords and len(word) > 2
        }
        
        return keywords
    
    def _generate_cluster_label(self, cluster_keywords, all_article_data, cluster_article_ids):
        """
        Generate a human-readable label for the cluster.
        Uses the most common keywords among articles in this cluster.
        """
        # Count keyword frequencies within this cluster's articles
        keyword_counts = Counter()
        
        for article_data in all_article_data:
            if article_data['id'] in cluster_article_ids:
                keyword_counts.update(article_data['keywords'])
        
        # Get top 3-4 most common keywords
        top_keywords = [word for word, count in keyword_counts.most_common(4)]
        
        # Create label
        if len(top_keywords) > 3:
            label = f"{top_keywords[0]}, {top_keywords[1]}, {top_keywords[2]}, {top_keywords[3]}"
        elif len(top_keywords) > 0:
            label = ", ".join(top_keywords)
        else:
            # Fallback to first article headline (truncated)
            for article_data in all_article_data:
                if article_data['id'] == cluster_article_ids[0]:
                    label = article_data['headline'][:50]
                    break
        
        return label
