import React, { useState, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Shirt,
  Key,
  Download,
  AlertCircle,
  History,
  Trash2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from "@gradio/client";

// Helper to convert URL to Blob
const urlToBlob = async (url) => {
  const response = await fetch(url);
  return await response.blob();
};

function App() {
  const [humanFile, setHumanFile] = useState(null);
  const [garmentFile, setGarmentFile] = useState(null);
  const [humanPreview, setHumanPreview] = useState("/demo-model.png");
  const [garmentPreview, setGarmentPreview] = useState("/demo-dress.png");
  const [description, setDescription] = useState("Green colour semi Formal Blazer");
  const [category, setCategory] = useState("upper_body");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('vton_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vton_history', JSON.stringify(history));
  }, [history]);

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your look history?")) {
      setHistory([]);
    }
  };

  const handleTryOn = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setStatusMsg('Connecting to AI Engine...');

    try {
      const app = await Client.connect("yisol/IDM-VTON");

      setStatusMsg('Preparing images...');

      let hBlob;
      if (humanFile) {
        hBlob = humanFile;
      } else {
        hBlob = await urlToBlob(humanPreview);
      }

      let gBlob;
      if (garmentFile) {
        gBlob = garmentFile;
      } else {
        gBlob = await urlToBlob(garmentPreview);
      }

      setStatusMsg('Starting generation...');

      // Submit job and listen for status updates
      const job = app.submit("/tryon", [
        {
          "background": hBlob,
          "layers": [],
          "composite": null
        },
        gBlob,
        description,
        true, // auto-mask
        true, // auto-crop
        30,   // steps
        42,   // seed
      ]);

      job.on("status", (s) => {
        if (s.stage === 'pending') {
          setStatusMsg(`Queued at position ${s.position || '...'}`);
        } else if (s.stage === 'processing') {
          setStatusMsg(`AI is processing your look... (${s.progress || 'calculating...'})`);
        } else if (s.stage === 'error') {
          setError("The AI model encountered an error. Please try again.");
        }
      });

      const predictResult = await job;

      if (predictResult && predictResult.data && predictResult.data[0]) {
        const resData = predictResult.data[0];
        const resUrl = resData.url || resData;
        setResult(resUrl);

        // Add to history
        const newLook = {
          id: Date.now(),
          url: resUrl,
          garment: garmentPreview,
          description: description,
          timestamp: new Date().toLocaleString()
        };
        setHistory(prev => [newLook, ...prev].slice(0, 20)); // Keep last 20

        setStatusMsg('Success!');
      } else {
        throw new Error("No output received from the AI model.");
      }

    } catch (err) {
      setError(err.message || 'Error occurred during generation. The Hugging Face Space might be busy.');
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="vton-logo">
            <Sparkles className="shine" size={40} />
          </div>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '10px', background: 'linear-gradient(to right, #7C3AED, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VTON AI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Your Personal Virtual Studio - 100% Free Generations
          </p>
        </motion.div>
      </header>

      <section className="glass-pane fade-in" style={{ padding: '32px', marginBottom: '40px' }}>
        <div className="grid-2">
          {/* Human Image Upload */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={20} color="var(--primary-color)" /> Your Photo
            </h3>
            <label className="dropzone">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange(e, setHumanFile, setHumanPreview)}
              />
              {humanPreview ? (
                <img src={humanPreview} alt="Human" />
              ) : (
                <>
                  <Upload size={32} color="var(--text-muted)" />
                  <p style={{ marginTop: '12px' }}>Upload your photo</p>
                </>
              )}
            </label>
          </div>

          {/* Garment Image Upload */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shirt size={20} color="var(--secondary-color)" /> Garment Photo
            </h3>
            <label className="dropzone">
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange(e, setGarmentFile, setGarmentPreview)}
              />
              {garmentPreview ? (
                <img src={garmentPreview} alt="Garment" />
              ) : (
                <>
                  <Upload size={32} color="var(--text-muted)" />
                  <p style={{ marginTop: '12px' }}>Upload garment photo</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: '24px' }}>
          <div className="input-group">
            <label className="input-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="upper_body">Upper Body</option>
              <option value="lower_body">Lower Body</option>
              <option value="dresses">Dresses</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Garment Description</label>
            <input
              type="text"
              placeholder="e.g. Green semi formal blazer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', height: '56px', fontSize: '1.2rem', gap: '12px' }}
          disabled={loading}
          onClick={handleTryOn}
        >
          {loading ? <RefreshCw className="animated-spinner" size={24} /> : <Sparkles size={24} />}
          {loading ? 'Processing...' : 'Generate New Look'}
        </button>

        {statusMsg && !error && (
          <p style={{ textAlign: 'center', marginTop: '12px', color: 'var(--secondary-color)', fontSize: '14px', fontWeight: 500 }}>
            {statusMsg}
          </p>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid var(--accent-color)',
              borderRadius: '12px',
              color: 'var(--accent-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <AlertCircle size={24} />
            <div style={{ flex: 1, fontSize: '14px' }}>{error}</div>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {(loading || result) && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="glass-pane result-banner"
            style={{ padding: '32px', textAlign: 'center' }}
          >
            <div className="result-container">
              {loading ? (
                <div className="skeleton result-skeleton" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div className="loader-circle"></div>
                    <p style={{ marginTop: '24px', fontWeight: 600 }}>{statusMsg}</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <Sparkles color="var(--secondary-color)" /> Your AI Look is Ready!
                  </h2>
                  <div className="image-comparison">
                    <img src={result} alt="Result" className="result-image" />
                    <div className="image-badge">AI Generated</div>
                  </div>
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <a
                      href={result}
                      download="try_on_result.png"
                      className="btn btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download size={20} /> Download
                    </a>
                    <button className="btn btn-secondary" onClick={() => setResult(null)}>
                      <RefreshCw size={20} /> Customize Again
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Look History Section */}
      {history.length > 0 && (
        <section className="glass-pane fade-in" style={{ padding: '32px', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History color="var(--primary-color)" /> Your Look Gallery
            </h2>
            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={clearHistory}>
              <Trash2 size={16} /> Clear Gallery
            </button>
          </div>
          <div className="history-grid">
            {history.map(look => (
              <motion.div
                key={look.id}
                className="history-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="history-thumb">
                  <img src={look.url} alt="Generation" />
                  <div className="history-overlay">
                    <a href={look.url} target="_blank" rel="noreferrer" className="icon-btn"><Maximize2 size={18} /></a>
                  </div>
                </div>
                <div className="history-info">
                  <p className="history-desc">{look.description}</p>
                  <p className="history-time">{look.timestamp}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <footer style={{ marginTop: '100px', textAlign: 'center', color: 'var(--text-muted)', paddingBottom: '40px' }}>
        <p>© 2026 VTON AI Studio - Powered by Hugging Face & Open Source Community</p>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animated-spinner {
          animation: spin 1.5s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vton-logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 10px 30px var(--primary-glow);
        }
        .vton-logo .shine { color: white; }
        
        .result-skeleton {
           background: rgba(30, 41, 59, 0.5);
           border: 1px solid rgba(255, 255, 255, 0.1);
           height: 500px;
           display: flex;
           align-items: center;
           justify-content: center;
        }
        
        .loader-circle {
           width: 60px;
           height: 60px;
           border: 4px solid rgba(255, 255, 255, 0.1);
           border-top: 4px solid var(--secondary-color);
           border-radius: 50%;
           animation: spin 1s linear infinite;
        }
        
        .history-grid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
           gap: 20px;
        }
        
        .history-card {
           background: rgba(15, 23, 42, 0.8);
           border-radius: 16px;
           overflow: hidden;
           border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .history-thumb {
           position: relative;
           aspect-ratio: 2/3;
           overflow: hidden;
        }
        
        .history-thumb img {
           width: 100%;
           height: 100%;
           object-fit: cover;
        }
        
        .history-overlay {
           position: absolute;
           inset: 0;
           background: rgba(0, 0, 0, 0.5);
           opacity: 0;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: 0.3s;
        }
        
        .history-card:hover .history-overlay { opacity: 1; }
        
        .history-info { padding: 12px; }
        .history-desc { 
           font-size: 14px; 
           font-weight: 600; 
           margin-bottom: 4px; 
           white-space: nowrap; 
           overflow: hidden; 
           text-overflow: ellipsis; 
        }
        .history-time { font-size: 11px; color: var(--text-muted); }
        
        .icon-btn {
           width: 40px;
           height: 40px;
           background: white;
           color: black;
           display: flex;
           align-items: center;
           justify-content: center;
           border-radius: 50%;
           text-decoration: none;
        }
        
        .image-comparison {
           position: relative;
           max-width: 450px;
           margin: 0 auto;
        }
        
        .image-badge {
           position: absolute;
           bottom: 16px;
           right: 16px;
           background: var(--primary-color);
           padding: 4px 12px;
           border-radius: 100px;
           font-size: 12px;
           font-weight: 700;
           box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
      `}} />
    </div>
  );
}

export default App;
