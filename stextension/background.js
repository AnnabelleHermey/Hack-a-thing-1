// This Chrome extension was built with help from:
// ChatGPT (OpenAI) – for understanding Chrome Extension structure,
// chrome.storage usage, and time-tracking logic
//
// Tutorial references:
// https://www.youtube.com/watch?v=60MRE4qb8PU
// https://www.youtube.com/watch?v=Zt_6UXvoKHM
//
// These sources were used for learning Chrome Extension APIs and patterns.
// Code was written and adapted specifically for this project in compliance
// with the Academic Honor Principle.

let current ={
  tabId: null,
  domain: null,
  startMs: null
};

// received pad start from Chat, rest came from experience
function todayKey(){
  // local date, YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// cs52 knowledge
function domainFromUrl(url){
  try{
    const u = new URL(url);
    // ignore chrome pages etc.
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.hostname;
  } catch{
    return null;
  }
}

// used chatgpt for this bit because I was struggling with connecting past and new knowledge
async function addTimeForCurrent(nowMs){
  if (!current.domain || !current.startMs) return;

  const deltaSec = Math.floor((nowMs - current.startMs) / 1000);
  if (deltaSec <= 0) return;

  const day = todayKey();
  const storageKey = `usage:${day}`;

  const data = await chrome.storage.local.get(storageKey);
  const usage = data[storageKey] ||{};

  usage[current.domain] = (usage[current.domain] || 0) + deltaSec;

  await chrome.storage.local.set({ [storageKey]: usage });

  // move start forward to avoid double-counting
  current.startMs = nowMs;
}

// used chat to figure out how to structue this specifically
async function setCurrentFromTab(tab){
  const nowMs = Date.now();
  await addTimeForCurrent(nowMs);

  const domain = tab?.url ? domainFromUrl(tab.url) : null;
  current ={
    tabId: tab?.id ?? null,
    domain,
    startMs: domain ? nowMs : null
  };
}

// switches tabs
// learnt from developer and yt vids
chrome.tabs.onActivated.addListener(async ({ tabId }) =>{
  const tab = await chrome.tabs.get(tabId);
  await setCurrentFromTab(tab);
});

// navigates to a new URL
// learnt from developer and yt vids
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) =>{
  // for the active tab
  if (tabId !== current.tabId) return;
  if (!changeInfo.url) return;
  await setCurrentFromTab(tab);
});

// focus changes
// // learnt from developer and yt vids but alao used chat to glue it to what I had
chrome.windows.onFocusChanged.addListener(async (windowId) =>{
  const nowMs = Date.now();

  // user switched awayy
  if (windowId === chrome.windows.WINDOW_ID_NONE){
    await addTimeForCurrent(nowMs);
    current ={ tabId: null, domain: null, startMs: null };
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab) await setCurrentFromTab(tab);
});

// initialize on start
async function init(){
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab) await setCurrentFromTab(tab);
}
init();
