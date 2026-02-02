import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: file.type,
            data: e.target.result.split(',')[1],
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const uploadedFileData = await Promise.all(filePromises);
    setUploadedFiles(prev => [...prev, ...uploadedFileData]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    setShowWelcome(false);
    const userMessage = { 
      role: 'user', 
      content: input,
      files: uploadedFiles.length > 0 ? uploadedFiles : null
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            files: msg.files
          }))
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        files: data.files || null,
        artifacts: data.artifacts || null
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = (fileData) => {
    const link = document.createElement('a');
    link.href = `data:${fileData.type};base64,${fileData.data}`;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearChat = () => {
    setMessages([]);
    setUploadedFiles([]);
    setShowWelcome(true);
  };

  const openClaudeAI = () => {
    window.open('https://claude.ai', '_blank', 'noopener,noreferrer');
  };

  const renderContent = (content) => {
    const formatted = content
      .split('\n')
      .map(line => {
        if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('```')) return '<pre><code>';
        if (line === '```') return '</code></pre>';
        if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
        return line;
      })
      .join('<br>');
    
    return formatted;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Claude AI Portal</h1>
          <p className="header-subtitle">API Integration • File Creation • Smart Assistance</p>
        </div>
        <div className="header-actions">
          <button onClick={openClaudeAI} className="claude-link-btn" title="Open full Claude.ai">
            🌐 Claude.ai
          </button>
          <button onClick={clearChat} className="clear-btn">Clear Chat</button>
        </div>
      </header>

      <div className="chat-container">
        <div className="messages">
          {showWelcome && messages.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to Claude AI Portal</h2>
              <p>Choose how you want to interact with Claude:</p>
              
              <div className="mode-cards">
                <div className="mode-card api-mode">
                  <div className="mode-icon">🤖</div>
                  <h3>API Mode (This Portal)</h3>
                  <ul>
                    <li>Fast responses</li>
                    <li>File uploads & downloads</li>
                    <li>Code generation</li>
                    <li>Document creation</li>
                    <li>Custom features</li>
                  </ul>
                  <div className="mode-status">✅ Active - Start typing below!</div>
                </div>
                
                <div className="mode-card web-mode">
                  <div className="mode-icon">🌟</div>
                  <h3>Full Claude.ai</h3>
                  <ul>
                    <li>All latest features</li>
                    <li>Projects & organization</li>
                    <li>Research mode</li>
                    <li>Conversation history</li>
                    <li>Advanced tools</li>
                  </ul>
                  <button onClick={openClaudeAI} className="open-claude-btn">
                    Open Claude.ai →
                  </button>
                </div>
              </div>

              <div className="quick-tips">
                <h4>💡 Quick Tips</h4>
                <div className="tips-grid">
                  <div className="tip">
                    <strong>API Mode:</strong> Great for quick tasks, file generation, code help
                  </div>
                  <div className="tip">
                    <strong>Claude.ai:</strong> Best for complex research, projects, long conversations
                  </div>
                </div>
              </div>

              <div className="example-prompts">
                <h4>Try asking:</h4>
                <div className="prompt-chips">
                  <span onClick={() => setInput("Create a Python script to organize files")}>
                    📝 "Create a Python script"
                  </span>
                  <span onClick={() => setInput("Analyze this data and create charts")}>
                    📊 "Analyze data"
                  </span>
                  <span onClick={() => setInput("Help me debug this code")}>
                    🐛 "Debug code"
                  </span>
                  <span onClick={() => setInput("Generate sample JSON data")}>
                    📄 "Generate JSON"
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div 
                  dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
                />
                
                {message.files && message.files.length > 0 && (
                  <div className="message-files">
                    {message.files.map((file, idx) => (
                      <div key={idx} className="file-badge">
                        📎 {file.name} ({(file.size / 1024).toFixed(1)}KB)
                      </div>
                    ))}
                  </div>
                )}

                {message.role === 'assistant' && message.files && (
                  <div className="download-section">
                    <h4>📥 Generated Files:</h4>
                    {message.files.map((file, idx) => (
                      <button 
                        key={idx}
                        onClick={() => downloadFile(file)}
                        className="download-btn"
                      >
                        <span className="download-icon">⬇️</span>
                        {file.name}
                      </button>
                    ))}
                  </div>
                )}

                {message.artifacts && (
                  <div className="artifact-section">
                    {message.artifacts.map((artifact, idx) => (
                      <div key={idx} className="artifact">
                        <div className="artifact-header">
                          <span>{artifact.title || 'Code'}</span>
                          <button 
                            onClick={() => navigator.clipboard.writeText(artifact.content)}
                            className="copy-btn"
                          >
                            📋 Copy
                          </button>
                        </div>
                        <pre className="artifact-code">
                          <code>{artifact.content}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-form">
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="uploaded-file">
                  <span>📎 {file.name}</span>
                  <button 
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="remove-file-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="input-row">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              style={{ display: 'none' }}
              accept="image/*,.pdf,.txt,.doc,.docx,.csv,.xlsx"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="attach-btn"
              disabled={isLoading}
              title="Upload files"
            >
              📎
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything or request a file..."
              disabled={isLoading}
              className="message-input"
            />
            
            <button 
              type="submit" 
              disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)} 
              className="send-btn"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;