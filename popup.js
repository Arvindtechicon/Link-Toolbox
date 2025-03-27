document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  const views = document.querySelectorAll('.views > div');
  const navButtons = document.querySelectorAll('.nav-button');
  const toolsList = document.getElementById('toolsList');
  const searchInput = document.getElementById('searchInput');
  const addToolForm = document.getElementById('addToolForm');

  // Load tools on startup
  loadTools();

  // Navigation
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const viewName = button.dataset.view;
      showView(viewName);
      
      navButtons.forEach(btn => {
        btn.classList.toggle('inactive', btn.dataset.view !== viewName);
      });
    });
  });

  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      filterTools(searchTerm);
    }, 300);
  });

  // Add tool form submission
  addToolForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTool = {
      id: Date.now(),
      name: document.getElementById('name').value,
      url: document.getElementById('url').value,
      category: document.getElementById('category').value,
      addedAt: Date.now()
    };

    addTool(newTool);
    addToolForm.reset();
    showView('list');
    navButtons[0].classList.remove('inactive');
    navButtons[1].classList.add('inactive');

    // Show success message
    showNotification('Tool added successfully!');
  });

  // Functions
  function showView(viewName) {
    views.forEach(view => {
      view.classList.remove('active');
    });
    setTimeout(() => {
      views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}View`);
      });
    }, 50);
  }

  function loadTools() {
    chrome.storage.sync.get(['aiTools'], (result) => {
      const tools = result.aiTools || [];
      renderTools(tools);
    });
  }

  function renderTools(tools) {
    if (tools.length === 0) {
      toolsList.innerHTML = `
        <div style="text-align: center; color: #6B7280; padding: 20px;">
          No tools found. Add your first tool!
        </div>
      `;
      return;
    }

    toolsList.innerHTML = tools.map(tool => `
      <div class="tool-card">
        <h3>${escapeHtml(tool.name)}</h3>
        <p>Category: ${escapeHtml(tool.category)}</p>
        <a href="${escapeHtml(tool.url)}" target="_blank" rel="noopener">Visit Tool</a>
      </div>
    `).join('');

    // Add click event listeners to all "Visit Tool" links
    const toolLinks = toolsList.querySelectorAll('a');
    toolLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Prevent the popup from closing immediately
        e.preventDefault();
        chrome.tabs.create({ url: link.href });
      });
    });
  }

  function filterTools(searchTerm) {
    chrome.storage.sync.get(['aiTools'], (result) => {
      const tools = result.aiTools || [];
      const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.category.toLowerCase().includes(searchTerm)
      );
      renderTools(filteredTools);
    });
  }

  function addTool(tool) {
    chrome.storage.sync.get(['aiTools'], (result) => {
      const tools = result.aiTools || [];
      tools.push(tool);
      chrome.storage.sync.set({ aiTools: tools }, () => {
        loadTools();
      });
    });
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.4);
      animation: slideUp 0.3s ease, slideDown 0.3s ease 2.7s;
      z-index: 1000;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});

// Add these styles to handle notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    to {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
  }
`;
document.head.appendChild(style);

