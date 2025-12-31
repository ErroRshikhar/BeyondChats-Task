import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ExternalLink, FileText, Sparkles } from 'lucide-react';
import './App.css';

const API_URL = 'http://localhost:5000/api/articles';

function App() {
  const [articles, setArticles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(API_URL);
        setArticles(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch articles", err);
        setLoading(false);
      }
    };

    fetchArticles();
    const interval = setInterval(fetchArticles, 3000);
    return () => clearInterval(interval);
  }, []);

  const selected = articles.find(a => a._id === activeId);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>BeyondChats Editor</h2>
          <span className="badge">{articles.length} Articles</span>
        </div>
        
        <div className="article-list">
          {articles.map(article => (
            <div 
              key={article._id} 
              onClick={() => setActiveId(article._id)} 
              className={`article-card ${activeId === article._id ? 'active' : ''}`}
            >
              <h4 className="article-title">{article.title}</h4>
              <div className={`status-indicator ${article.status.toLowerCase()}`}>
                {/* Status indicators kept for backend tracking, but UI is simplified */}
                {article.status === 'Processing' && <Loader2 className="spin" size={12} />}
                {article.status === 'Completed' && <Sparkles size={12} />}
                <span>{article.status}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="main-content">
        {!selected ? (
          <div className="no-selection">
            <div className="placeholder-icon"><FileText size={48} /></div>
            <h3>Select an article to view details</h3>
          </div>
        ) : (
          <div className="comparison-container single-view">
            {/* ONLY ONE PANEL NOW */}
            <section className="panel original-panel">
              <div className="panel-header">
                <h3><FileText size={18}/> Article Content</h3>
                <a href={selected.url} target="_blank" rel="noreferrer" className="link-btn">
                  Visit Source <ExternalLink size={12}/>
                </a>
              </div>
              <div className="panel-body">
                <p>{selected.original_content}</p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;