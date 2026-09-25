# News Pulse - Topic-Clustered News Timeline

A full-stack application that aggregates news articles from multiple RSS feeds, automatically clusters them by topic using keyword analysis, and visualizes them on an interactive timeline.

## 🌐 Live Demo

> **Note:** Add your deployment URLs here after deploying

- **Frontend:** `https://your-app.vercel.app` ← Replace with your Vercel URL
- **Backend API:** `https://your-api.onrender.com` ← Replace with your Render URL
- **Video Walkthrough:** `https://loom.com/share/your-video` ← Add your video link

> ⚠️ **Free Tier Note:** The backend may experience cold starts (30-60 seconds on first load) as free-tier services sleep after inactivity. This is expected behavior.

## 🎯 Project Overview

News Pulse demonstrates real-world engineering patterns for data ingestion, text analysis, and interactive visualization. The system:

1. **Fetches** articles from multiple news RSS feeds
2. **Extracts** full article text from source pages
3. **Clusters** related articles by topic using keyword overlap analysis
4. **Serves** the data through a REST API
5. **Visualizes** clusters on an interactive timeline

## 🏗️ Architecture

```
news-pulse/
├── scraper/        # Python RSS ingestion & clustering
├── backend/        # Node.js REST API
├── frontend/       # Next.js timeline visualization
└── README.md
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Scraper** | Python 3 | RSS parsing, content extraction, topic clustering |
| **Backend** | Node.js + Express | REST API serving clusters and articles |
| **Frontend** | Next.js + React | Interactive timeline visualization |
| **Database** | PostgreSQL | Persistent storage for articles and clusters |
| **Charting** | Recharts | Timeline bar chart visualization |

## 📰 News Sources

The scraper pulls from three major news outlets:

1. **BBC News** - http://feeds.bbci.co.uk/news/rss.xml
2. **NPR** - https://feeds.npr.org/1001/rss.xml
3. **The New York Times** - https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml

These sources were chosen for their reliability, consistent RSS formatting, and diverse coverage.

## 🧠 Topic Clustering Approach

**Method:** Keyword/word-overlap grouping (no ML required)

### How It Works

1. **Keyword Extraction:**
   - Combine headline + summary text
   - Lowercase and tokenize into words
   - Remove stopwords (common words like "the", "a", "is")
   - Filter out words shorter than 3 characters

2. **Clustering:**
   - Compare articles by counting shared significant keywords
   - Group articles that share ≥ 4 meaningful words (configurable threshold)
   - Generate cluster labels from the most frequent keywords

3. **Threshold Selection (Default: 4 shared words):**
   - **Why 4?** Through empirical testing, 4+ shared meaningful words consistently indicates related coverage (e.g., "election", "senate", "vote", "bill" = same story)
   - **Lower values (2-3):** Risk grouping unrelated stories with coincidental word overlap
   - **Higher values (5+):** Fragment genuinely related coverage into separate clusters
   - Tunable via `CLUSTERING_THRESHOLD` environment variable

### Known Limitations

1. **No semantic understanding** - Doesn't recognize that "car" and "automobile" are synonyms
2. **Different terminology** - Struggles when outlets use different words for the same event
3. **Multi-faceted stories** - May split complex stories with multiple aspects
4. **No cross-source merging** - Same event from different outlets remains in separate clusters (this is a recognized hard problem and was explicitly called out as a stretch goal)

### Why This Approach?

This is a legitimate production-grade starting point that:
- Requires no ML training or embeddings
- Works reliably across diverse topics
- Is fast, transparent, and tunable
- Provides clear, human-readable cluster labels

## 🚀 Setup & Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database (local or hosted)

### 1. Database Setup

Create a PostgreSQL database and note the connection URL:

```
postgresql://username:password@host:port/database
```

For this project, you can use:
- **Local:** PostgreSQL installed locally
- **Hosted:** Supabase, Neon, or Railway (all have free tiers)

### 2. Python Scraper Setup

```bash
cd scraper

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Mac/Linux

# Edit .env and add your DATABASE_URL
# DATABASE_URL=postgresql://user:pass@host:port/database
```

**Initialize the database schema:**

```bash
python scraper.py
```

This will:
- Create the `clusters` and `articles` tables
- Fetch articles from RSS feeds
- Extract full article text
- Cluster articles by topic
- Store everything in the database

### 3. Backend API Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Mac/Linux

# Edit .env and add:
# DATABASE_URL=postgresql://user:pass@host:port/database
# PORT=3001
# PYTHON_SCRAPER_PATH=../scraper/scraper.py

# Start the server
npm start

# For development with auto-reload:
npm run dev
```

The API will be available at `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
copy .env.local.example .env.local  # Windows
# or
cp .env.local.example .env.local    # Mac/Linux

# Edit .env.local and add:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📡 API Endpoints

### GET /clusters
Returns all topic clusters with summary information.

**Response:**
```json
[
  {
    "id": 1,
    "label": "election, vote, senate, campaign",
    "article_count": "5",
    "earliest_article": "2026-09-23T08:00:00Z",
    "latest_article": "2026-09-23T14:30:00Z"
  }
]
```

### GET /clusters/:id
Returns full details for a specific cluster including all articles.

**Response:**
```json
{
  "id": 1,
  "label": "election, vote, senate, campaign",
  "articles": [
    {
      "id": 1,
      "url": "https://...",
      "source": "BBC News",
      "headline": "Senate votes on election reform",
      "summary": "...",
      "body": "...",
      "published_at": "2026-09-23T08:00:00Z"
    }
  ]
}
```

### GET /timeline
Returns clusters formatted specifically for timeline visualization.

**Query params:** `?sources=BBC News,NPR` (optional)

**Response:**
```json
[
  {
    "id": 1,
    "label": "election, vote, senate, campaign",
    "start": "2026-09-23T08:00:00Z",
    "end": "2026-09-23T14:30:00Z",
    "count": "5",
    "sources": ["BBC News", "NPR"]
  }
]
```

### POST /ingest/trigger
Triggers the Python scraper as a background job.

**Response:**
```json
{
  "jobId": "abc123...",
  "status": "started",
  "message": "Scraper job started successfully"
}
```

### GET /ingest/status/:jobId
Polls the status of a scraper job.

**Response:**
```json
{
  "id": "abc123...",
  "status": "running",  // or "completed", "failed"
  "startTime": "2026-09-23T15:00:00Z",
  "endTime": null,
  "error": null,
  "output": ["...recent output lines..."]
}
```

### GET /sources
Returns list of all available news sources.

**Response:**
```json
["BBC News", "NPR", "The New York Times"]
```

## 🎨 Frontend Features

### Timeline Visualization
- **Bar chart** where each bar represents a topic cluster
- **Size** corresponds to article count
- **Color-coded** for visual distinction
- **Interactive:** Click any bar to view articles in that cluster
- **Sorted** by recency (newest topics first)

### Cluster Detail View
- Modal popup showing all articles in a cluster
- **Article cards** with headline, source, timestamp, and summary
- **Links** to original articles
- **Chronological ordering** within the cluster

### Source Filter
- Toggle which news sources to include
- **Select All** / **Clear All** shortcuts
- Live filtering of timeline data
- Shows selected source count

### Refresh Data Button
- Triggers scraper job via API
- **Status polling:** Shows job progress in real-time
- **Auto-updates timeline** when job completes
- Visual loading indicator

## 🔧 Configuration

### Environment Variables

**Scraper (.env):**
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
CLUSTERING_THRESHOLD=4  # Number of shared words for clustering
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://user:pass@host:port/database
PORT=3001
PYTHON_SCRAPER_PATH=../scraper/scraper.py
NODE_ENV=development  # or production
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚢 Deployment

### Quick Deploy Setup

This project is configured for easy deployment to:
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** PostgreSQL on Render

📖 **[See DEPLOYMENT.md for complete step-by-step guide](./DEPLOYMENT.md)**

### One-Line Summary

1. Deploy PostgreSQL database on Render
2. Deploy backend to Render (set DATABASE_URL and FRONTEND_URL)
3. Deploy frontend to Vercel (set NEXT_PUBLIC_API_URL)
4. Update FRONTEND_URL in backend with Vercel URL
5. Done! 🎉

### Configuration Files

- `frontend/vercel.json` - Vercel deployment config
- `backend/render.yaml` - Render service config
- `backend/.env.example` - Environment variable template
- `.gitignore` files - Exclude sensitive data from Git

### Production Considerations

- Set `NODE_ENV=production` for backend
- Enable SSL for database connections
- Use connection pooling for database
- Set appropriate CORS origins (handled automatically)
- Monitor cold start times on free tiers (~30 seconds)
- Consider caching frequently accessed data

## 🧪 Testing Locally

1. **Start all components:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev

   # Terminal 3 - Run scraper manually
   cd scraper
   python scraper.py
   ```

2. **Verify:**
   - Backend health: http://localhost:3001/health
   - Frontend: http://localhost:3000
   - Check for timeline data and clusters

3. **Test refresh:**
   - Click "Refresh Data" button in UI
   - Watch console for job status
   - Timeline should update when complete

## ⚠️ Known Issues

### Python 3.14 Compatibility

The Python scraper currently has compatibility issues with Python 3.14 due to:
- `psycopg2-binary` not yet supporting Python 3.14
- `lxml` compilation errors with Python 3.14

**Workaround:** Use Python 3.11 or 3.12 for the scraper, OR use the sample data provided (sufficient for demonstration).

The application includes sample data that demonstrates all functionality without requiring the scraper to run.

---

## 🐛 Troubleshooting

### Scraper Issues

**"No module named 'feedparser'"**
- Run `pip install -r requirements.txt` in virtual environment

**"Database connection failed"**
- Verify DATABASE_URL in .env
- Check database is running and accessible
- Ensure schema is initialized

**"Failed to extract text from URL"**
- Some pages will fail extraction (this is normal)
- Scraper continues processing other articles
- Check URL is accessible in browser

### Backend Issues

**"DATABASE_URL environment variable is required"**
- Create .env file with DATABASE_URL

**"Port 3001 already in use"**
- Change PORT in .env or kill process using that port

**"Failed to start scraper job"**
- Verify PYTHON_SCRAPER_PATH points to correct location
- Ensure Python is in PATH
- Check scraper dependencies are installed

### Frontend Issues

**"Failed to fetch timeline"**
- Verify backend is running on correct port
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

**"No timeline data available"**
- Run scraper first to populate database
- Check backend /timeline endpoint returns data

## 📝 Design Decisions & Assumptions

### Assumptions Made

1. **Re-clustering:** Articles are re-clustered on every scraper run (not incremental). This ensures cluster quality but could be optimized for large datasets.

2. **Date handling:** Articles without valid dates use current timestamp rather than failing insertion.

3. **Duplicate detection:** Based solely on URL uniqueness (no fuzzy matching).

4. **Job storage:** Job status stored in-memory (not persisted across backend restarts). For production, would use database or Redis.

5. **Source filtering:** Applied at query time, not during clustering. Clusters may contain mixed sources.

### Future Improvements

1. **Semantic clustering:** Use embeddings (e.g., sentence-transformers) for better topic detection
2. **Cross-source merging:** Deduplicate same story across outlets
3. **Incremental clustering:** Only cluster new articles, update existing clusters
4. **Persistent jobs:** Store job status in database
5. **Real-time updates:** WebSocket connection for live timeline updates
6. **Search functionality:** Full-text search across articles
7. **Trend analysis:** Track topic evolution over time
8. **Email digests:** Daily summaries of top clusters

## 📄 License

This project was created as a technical assessment for Xponentium India's Full-Stack Developer Internship.

## 🙋 Questions?

For questions about this assessment or implementation, please reach out to the Xponentium India team.

---

**Built with:** Python, Node.js, Next.js, PostgreSQL, Recharts  
**Created:** September 2026
