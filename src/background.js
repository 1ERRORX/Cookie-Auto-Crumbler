import { parse } from 'tldts';

//actions when closing a tab
chrome.tabs.onRemoved.addListener(() => 
{
  chrome.storage.sync.get({autocleanEnabled: true, whitelist: []}, function(data) 
  {

    if (!data.autocleanEnabled) return;

    //getting a list of domains from the whitelist
    const whitelist = data.whitelist;

    chrome.tabs.query({}, openTabs => 
    {
      //creating a set to store unique domains of open tabs
      const openTabDomains = new Set();
      openTabs.forEach(tab => 
      {
        if (tab.url) 
        {
          const tabDomain = parse(tab.url).domainWithoutSuffix;
          if (tabDomain) 
          {
            openTabDomains.add(tabDomain);
          }
        }
      });
      
      //getting all cookies from the browser
      chrome.cookies.getAll({}, allCookies =>
      {
        //creating a set for the domains that need to be cleared
        const domainsToRemove = new Set();

        //the list of cookies is sorted through and the processed domains are compared
        allCookies.forEach(cookie =>
        {
          const parsedCookieDomain = parse(cookie.domain);
          const cookieDomainWithoutSuffix = parsedCookieDomain.domainWithoutSuffix;
          
          // checking if the domain is on the whitelist
          const isWhitelisted = whitelist.some(domain => 
            domain.includes(cookieDomainWithoutSuffix) || 
            cookie.domain.includes(domain)
          );
          
          if (!isWhitelisted && !openTabDomains.has(cookieDomainWithoutSuffix)) 
          {
            let cleanDomain = cookie.domain;
            if (cookie.domain.startsWith('.')) 
            {
              cleanDomain = cookie.domain.slice(1);
            }
            domainsToRemove.add(cleanDomain);
          }
        });
        
        const origins = [];

        domainsToRemove.forEach(domain =>
        {
          //checking links for ip adress (not DNS)
          const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain);

          //creating origins for Chrome API
          if (isIpAddress) 
          {
            origins.push(`http://${domain}`, `https://${domain}`);
          } 
          else 
          {
            origins.push(`http://${domain}`, `https://${domain}`);
            if (domain.includes('.')) 
            {
              origins.push(`http://*.${domain}`, `https://*.${domain}`);
            }
          }
        });

        if (origins.length > 0) 
        {

          // removing cookies and another data (supported origins)
          chrome.browsingData.remove(
            { origins: origins },
            { 
              cacheStorage: true,
              cookies: true,
              fileSystems: true,
              indexedDB: true,
              localStorage: true,
              pluginData: true,
              serviceWorkers: true,
              webSQL: true
            }
          );
        }
      });

      // deleting the remaining data
      chrome.browsingData.remove({}, 
      {
        appcache: true,
        cache: true,
        fileSystems: true,
        indexedDB: true,
        pluginData: true,
        serviceWorkers: true,
        webSQL: true
      });
    });
  });
});