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
const LIMIT_SECONDS_PER_DOMAIN = 20*60; // 20 minutes
const REDIRECTED_KEY_PREFIX = "redirected:"; // per-day map

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
  await maybeRedirectIfOverLimit(current.domain);
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

async function maybeRedirectIfOverLimit(domain) {
  if (!domain || !current.tabId) return;

  const day = todayKey();
  const usageKey = `usage:${day}`;
  const redirectedKey = `${REDIRECTED_KEY_PREFIX}${day}`;

  const data = await chrome.storage.local.get([usageKey, redirectedKey]);
  const usage = data[usageKey] || {};
  const redirected = data[redirectedKey] || {};

  const seconds = usage[domain] || 0;
  if (seconds < LIMIT_SECONDS_PER_DOMAIN) return;

  // Only redirect once per domain per day
  if (redirected[domain]) return;

  redirected[domain] = true;
  await chrome.storage.local.set({ [redirectedKey]: redirected });

  // Redirect active tab to extension break page
  const breakUrl = chrome.runtime.getURL(`break.html?from=${encodeURIComponent(domain)}`);
  await chrome.tabs.update(current.tabId, { url: breakUrl });
}


// so time accumulates even when you stay on one tab
// had a bug and couldn't figure out why it stopped counting time and then I realized I was doing nothing to count time if you are there for a while
// Updated by Claude Code (Sonnet 4.5) - Hybrid approach using both setInterval and chrome.alarms
// setInterval provides second-level accuracy when service worker is active
// chrome.alarms persists across service worker suspensions to prevent losing time
let tickInterval = null;

function startTicking() {
  if (tickInterval) clearInterval(tickInterval);
  // Tick every 1 second for accurate time tracking
  tickInterval = setInterval(async () => {
    await addTimeForCurrent(Date.now());
  }, 1000);
}

// Updated by Claude Code (Sonnet 4.5) - Added chrome.alarms as backup for when service worker suspends
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "keepalive") return;
  // When alarm fires, flush current time and restart setInterval if needed
  await addTimeForCurrent(Date.now());
  startTicking();
});

// I noticed that I wasn't updating the popup while on the tab and the "Flush_now" was what Chat reccomended to fix this 
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "FLUSH_NOW") {
    addTimeForCurrent(Date.now()).then(() => sendResponse({ ok: true }));
    return true;
  }
});



// initialize on start
// Updated by Claude Code (Sonnet 4.5) - Use both setInterval and chrome.alarms for reliability
// chrome.alarms keeps service worker alive and handles suspensions
async function init(){
  // Create persistent alarm to keep service worker alive and handle suspensions
  // Updated by Claude Code (Sonnet 4.5) - Removed duplicate "tick" alarm
  await chrome.alarms.create("keepalive", { periodInMinutes: 1 });

  // Start setInterval for second-level accuracy
  startTicking();

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab) await setCurrentFromTab(tab);
}
init();
