document.addEventListener('DOMContentLoaded', function() {
  
  // just for interface (links to DOM elements)
  const mainTab = document.getElementById('main-tab');
  const whitelistTab = document.getElementById('whitelist-tab');
  const mainContent = document.getElementById('main-content');
  const whitelistContent = document.getElementById('whitelist-content');
  const addCurrentBtn = document.getElementById('add-current');
  const removeCurrentBtn = document.getElementById('remove-current');
  const manualUrlInput = document.getElementById('manual-url');
  const addManualBtn = document.getElementById('add-manual');
  const clearAllCacheBtn = document.getElementById('clear-all-cache');
  const whitelistContainer = document.getElementById('whitelist-container');
  const logoElement = document.getElementById('logo');
  const aboutTab = document.getElementById('about-tab');
  const aboutContent = document.getElementById('about-content');
  const autocleanToggle = document.getElementById('autoclean-toggle');
  const bulkTab = document.getElementById('bulk-tab');
  const bulkContent = document.getElementById('bulk-content');
  const bulkUrlsTextarea = document.getElementById('bulk-urls');
  const addBulkBtn = document.getElementById('add-bulk');
  const wipeAllCookiesBtn = document.getElementById('wipe-all-cookies');
  const wipeAllDataBtn = document.getElementById('wipe-all-data');

  // status of the automatic cleanup switch
  chrome.storage.sync.get({autocleanEnabled: true}, function(data) 
  {
    autocleanToggle.checked = data.autocleanEnabled;
  });

  // app logo
  chrome.storage.sync.get({customLogo: null}, function(data) 
  {
    if (data.customLogo) 
    {
      logoElement.src = data.customLogo;
    }
  });

  // saving status of the automatic cleanup switch
  autocleanToggle.addEventListener('change', function() 
  {
    chrome.storage.sync.set({autocleanEnabled: this.checked}, function()
    {
      console.log('Autoclean setting updated:', this.checked);
    });
  });

  // handlers for switching between interface tabs
  mainTab.addEventListener('click', () => 
  {
    mainTab.classList.add('active');
    whitelistTab.classList.remove('active');
    bulkTab.classList.remove('active');
    aboutTab.classList.remove('active');
    mainContent.classList.remove('hidden');
    whitelistContent.classList.add('hidden');
    bulkContent.classList.add('hidden');
    aboutContent.classList.add('hidden');
  });

  whitelistTab.addEventListener('click', () => 
  {
    whitelistTab.classList.add('active');
    mainTab.classList.remove('active');
    bulkTab.classList.remove('active');
    aboutTab.classList.remove('active');
    whitelistContent.classList.remove('hidden');
    mainContent.classList.add('hidden');
    bulkContent.classList.add('hidden');
    aboutContent.classList.add('hidden');
    loadWhitelist();
  });

  aboutTab.addEventListener('click', () => 
  {
    aboutTab.classList.add('active');
    mainTab.classList.remove('active');
    whitelistTab.classList.remove('active');
    bulkTab.classList.remove('active');
    aboutContent.classList.remove('hidden');
    mainContent.classList.add('hidden');
    whitelistContent.classList.add('hidden');
    bulkContent.classList.add('hidden');
  });

  bulkTab.addEventListener('click', () =>
  {
    bulkTab.classList.add('active');
    mainTab.classList.remove('active');
    whitelistTab.classList.remove('active');
    aboutTab.classList.remove('active');
    bulkContent.classList.remove('hidden');
    mainContent.classList.add('hidden');
    whitelistContent.classList.add('hidden');
    aboutContent.classList.add('hidden');
  });

  // getting the URL of the currently active tab to display in the input field
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
  {
    if (tabs[0] && tabs[0].url) 
    {
      const url = new URL(tabs[0].url);
      manualUrlInput.placeholder = `Current: ${url.hostname}`;
    }
  });

  // adding the current site to the whitelist
  addCurrentBtn.addEventListener('click', function() 
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) 
    {
      if (tabs[0] && tabs[0].url) 
      {
        const url = new URL(tabs[0].url);
        addToWhitelist(url.hostname);
      }
    });
  });

  // removing the current site from the whitelist
  removeCurrentBtn.addEventListener('click', function() 
  {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
      if (tabs[0] && tabs[0].url) 
      {
        const url = new URL(tabs[0].url);
        removeFromWhitelist(url.hostname);
      }
    });
  });

  // custom adding URL
  addManualBtn.addEventListener('click', function() 
  {
    const urlInput = manualUrlInput.value.trim();
    if (urlInput) 
      {
      try 
      {
        const url = new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`);
        addToWhitelist(url.hostname);
        manualUrlInput.value = '';
      } 
      catch (e) 
      {
        alert('Please enter a valid URL');
      }
    }
  });

  //adding URLs from a text field en masse (one per line)
  addBulkBtn.addEventListener('click', function() 
  {
    const urlsText = bulkUrlsTextarea.value.trim();
    if (!urlsText) return;

    const urls = urlsText.split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) 
    {
      alert('Please enter at least one valid URL');
      return;
    }

    chrome.storage.sync.get({whitelist: []}, function(data) 
    {
      const existingUrls = new Set(data.whitelist);
      const newUrls = [];
      let duplicates = 0;

      urls.forEach(url => 
      {
        try {
          const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
          const hostname = parsedUrl.hostname;
          
          if (!existingUrls.has(hostname)) 
          {
            newUrls.push(hostname);
            existingUrls.add(hostname);
          } 
          else 
          {
            duplicates++;
          }
        } 
        catch (e) 
        {
          console.log('Invalid URL:', url);
        }
      });

      if (newUrls.length > 0) 
      {
        const updatedWhitelist = [...data.whitelist, ...newUrls];
        chrome.storage.sync.set({whitelist: updatedWhitelist}, function() 
        {
          const message = `Added ${newUrls.length} new URLs to whitelist`;
          alert(duplicates > 0 ? `${message} (${duplicates} duplicates skipped)` : message);
          bulkUrlsTextarea.value = '';
          loadWhitelist();
        });
      } 
      else 
      {
        alert('All URLs are already in whitelist');
      }
    });
  });

  // options for cleaning browser data
  clearAllCacheBtn.addEventListener('click', function() 
  {
    if (confirm('WARNING! This will clear ALL cache for ALL sites. Continue?')) 
    {
      chrome.browsingData.remove({},
      {
        appcache: true,
        cache: true,
        cacheStorage: true,
        formData: true,
        fileSystems: true,
        indexedDB: true,
        localStorage: true,
        pluginData: true,
        serviceWorkers: true,
        webSQL: true
      },
      function() 
      {
        alert('All cache has been cleared successfully!');
      }
      );
    }
  });

  // options for cleaning browser data
  wipeAllCookiesBtn.addEventListener('click', function() 
  {
    if (confirm('WARNING! This will delete ALL cookies from ALL sites, including whitelisted ones. Continue?')) 
    {
      chrome.browsingData.removeCookies({}, function() 
      {
        alert('All cookies have been wiped successfully!');
      });
    }
  });

  // options for cleaning browser data
  wipeAllDataBtn.addEventListener('click', function() 
  {
    if (confirm('WARNING! This will delete ALL browsing data from ALL sites, including whitelisted ones. Continue?')) 
    {
      chrome.browsingData.remove({}, 
      {
        cacheStorage: true,
        cookies: true,
        appcache: true,
        cache: true,
        fileSystems: true,
        indexedDB: true,
        localStorage: true,
        pluginData: true,
        serviceWorkers: true,
        webSQL: true
      }, () => 
      {
        console.log('Все данные браузера очищены');
      });
    }
  });

  // loading and displaying the whitelist
  function loadWhitelist() {
    chrome.storage.sync.get({whitelist: []}, function(data) 
    {
      whitelistContainer.innerHTML = '';
      
      if (data.whitelist.length === 0) 
      {
        whitelistContainer.innerHTML = '<p>No whitelisted sites</p>';
        return;
      }
      
      const deleteAllBtn = document.createElement('button');
      deleteAllBtn.textContent = 'Delete All Links';
      deleteAllBtn.className = 'danger';
      deleteAllBtn.addEventListener('click', deleteAllWhitelist);
      whitelistContainer.appendChild(deleteAllBtn);

      data.whitelist.forEach((site, index) => 
      {
        const item = document.createElement('div');
        item.className = 'whitelist-item';
        
        const urlSpan = document.createElement('span');
        urlSpan.className = 'whitelist-url';
        urlSpan.textContent = site;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'whitelist-actions';
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editWhitelistItem(index, site));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'danger';
        deleteBtn.addEventListener('click', () => removeFromWhitelist(site));
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        item.appendChild(urlSpan);
        item.appendChild(actionsDiv);
        
        whitelistContainer.appendChild(item);
      });
    });
  }

//functions for working with the whitelist:
  function deleteAllWhitelist() {
    if (confirm('Are you sure you want to delete ALL whitelisted links?')) 
    {
      chrome.storage.sync.set({whitelist: []}, function() 
      {
        alert('All whitelisted links have been removed');
        loadWhitelist();
      });
    }
  }

  function addToWhitelist(site) {
    chrome.storage.sync.get({whitelist: []}, function(data) 
    {
      if (!data.whitelist.includes(site)) 
      {
        const updatedWhitelist = [...data.whitelist, site];
        chrome.storage.sync.set({whitelist: updatedWhitelist}, function() 
        {
          alert(`✅ ${site} added to whitelist`);
          loadWhitelist();
        });
      } 
      else 
      {
        alert(`ℹ️ ${site} is already in whitelist`);
      }
    });
  }

  function removeFromWhitelist(site) 
  {
    chrome.storage.sync.get({whitelist: []}, function(data) 
    {
      const index = data.whitelist.indexOf(site);
      if (index !== -1) 
      {
        const updatedWhitelist = [...data.whitelist];
        updatedWhitelist.splice(index, 1);
        chrome.storage.sync.set({whitelist: updatedWhitelist}, function() 
        {
          alert(`✅ ${site} removed from whitelist`);
          loadWhitelist();
        });
      } 
      else 
      {
        alert(`⚠️ ${site} not found in whitelist`);
      }
    });
  }

  function editWhitelistItem(index, oldSite) 
  {
    const newSite = prompt('Edit whitelist URL:', oldSite);
    if (newSite && newSite !== oldSite) 
    {
      try 
      {
        const url = new URL(newSite.startsWith('http') ? newSite : `https://${newSite}`);
        chrome.storage.sync.get({whitelist: []}, function(data) 
        {
          const updatedWhitelist = [...data.whitelist];
          updatedWhitelist[index] = url.hostname;
          chrome.storage.sync.set({whitelist: updatedWhitelist}, function() 
          {
            loadWhitelist();
          });
        });
      } 
      catch (e) 
      {
        alert('Please enter a valid URL!');
      }
    }
  }
});

// set logo
function setExtensionLogo(logoUrl) 
{
  chrome.storage.sync.set({customLogo: logoUrl}, function() 
  {
    document.getElementById('logo').src = logoUrl;
  });
}