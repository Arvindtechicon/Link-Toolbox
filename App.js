import React, { useState, useEffect } from 'react';
import ToolList from './components/ToolList.js';
import AddTool from './components/AddTool.js';
import SearchBar from './components/SearchBar.js';

function App() {
  const [tools, setTools] = useState([]);
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['aiTools'], (result) => {
      if (result.aiTools) {
        setTools(result.aiTools);
      }
    });
  }, []);

  const addTool = (newTool) => {
    const updatedTools = [...tools, { ...newTool, id: Date.now() }];
    setTools(updatedTools);
    chrome.storage.sync.set({ aiTools: updatedTools });
  };

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
        AI Tools Directory
      </h1>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex justify-center space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${view === 'list' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setView('list')}
        >
          View Tools
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'add' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setView('add')}
        >
          Add Tool
        </button>
      </div>
      {view === 'list' ? (
        <ToolList tools={filteredTools} />
      ) : (
        <AddTool addTool={addTool} setView={setView} />
      )}
    </div>
  );
}

export default App;

