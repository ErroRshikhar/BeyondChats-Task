import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ExternalLink, FileText, Sparkles, AlertCircle } from 'lucide-react';
import './App.css';

// Ensure this matches your backend port
const API_URL = 'http://localhost:5000/api/articles';

function App() {
  const [articles, setArticles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll for updates every 3 seconds
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

  // Get currently selected article
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
                {article.status === 'Processing' && <Loader2 className="spin" size={12} />}
                {article.status === 'Completed' && <Sparkles size={12} />}
                <span>{article.status}</span>
              </div>
            </div>
          ))}
          
          {articles.length === 0 && !loading && (
            <div className="empty-state">No articles found. Run the seed script!</div>
          )}
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="main-content">
        {!selected ? (
          <div className="no-selection">
            <div className="placeholder-icon"><FileText size={48} /></div>
            <h3>Select an article to view details</h3>
            <p>Choose an item from the sidebar to compare the original and AI-enhanced versions.</p>
          </div>
        ) : (
          <div className="comparison-container">
            {/* Panel 1: Original */}
            <section className="panel original-panel">
              <div className="panel-header">
                <h3><FileText size={18}/> Original Content</h3>
                <a href={selected.url} target="_blank" rel="noreferrer" className="link-btn">
                  Visit Source <ExternalLink size={12}/>
                </a>
              </div>
              <div className="panel-body">
                <p>{selected.original_content}</p>
              </div>
            </section>

            {/* Panel 2: AI Enhanced */}
            <section className="panel ai-panel">
              <div className="panel-header">
                <h3><Sparkles size={18}/> AI Enhanced Version</h3>
                {selected.status === 'Processing' && <span className="tag processing">Processing...</span>}
              </div>
              
              <div className="panel-body">
                {selected.status === 'Completed' ? (
                  <>
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{__html: selected.updated_content}} 
                    />
                    
                    {selected.reference_links && selected.reference_links.length > 0 && (
                      <div className="citations-box">
                        <h4>Sources & Citations</h4>
                        <ul>
                          {selected.reference_links.map((link, i) => (
                             <li key={i}>
                               <a href={link} target="_blank" rel="noreferrer">
                                 {link} <ExternalLink size={10}/>
                               </a>
                             </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : selected.status === 'Processing' ? (
                  <div className="loading-state">
                    <Loader2 className="spin" size={40} />
                    <p>AI is currently researching and rewriting this article...</p>
                    <small>This may take 10-20 seconds.</small>
                  </div>
                ) : (
                  <div className="waiting-state">
                    <AlertCircle size={30} />
                    <p>Waiting for worker to start.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;