var cleanedTitle = document.title.replace(' - Wikipedia, the free encyclopedia', '');

chrome.runtime.sendMessage({
    'payload': 'update',
    'name': cleanedTitle}
);
