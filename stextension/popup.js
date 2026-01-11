// This Chrome extension was built with help from:
// ChatGPT (OpenAI) – for understanding Chrome Extension structure,
// chrome.storage usage, and time-tracking logic
//
// Tutorial references:
// https://www.youtube.com/watch?v=60MRE4qb8PU
// https://www.youtube.com/watch?v=Zt_6UXvoKHM
// https://developer.chrome.com/docs/extensions/reference/api/storage 
//
// These sources were used for learning Chrome Extension APIs and patterns.
// Code was written and adapted specifically for this project in compliance
// with the Academic Honor Principle.

// received pad start from Chat, rest came from experience
function todayKey(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Conversed with Chat about how to best display this
function formatTime(seconds){
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// learnt a lot from chrome for developers help page
// also the for loop and reduce statement was created with Chat
async function load(){
  const day = todayKey();
  document.getElementById("date").textContent = day;

  const storageKey = `usage:${day}`;
  const data = await chrome.storage.local.get(storageKey);
  const usage = data[storageKey] ||{};

  const entries = Object.entries(usage).sort((a, b) => b[1] - a[1]);

  const totalSeconds = entries.reduce((sum, [, sec]) => sum + sec, 0);
  document.getElementById("total").textContent = formatTime(totalSeconds);

  const list = document.getElementById("list");
  list.innerHTML = "";

  const empty = document.getElementById("empty");
  empty.style.display = entries.length ? "none" : "block";

  for (const [domain, sec] of entries.slice(0, 8)){
    const li = document.createElement("li");
    li.innerHTML = `<span>${domain}</span> <span class="muted time">${formatTime(sec)}</span>`;
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.gap = "10px";
    list.appendChild(li);
  }
}

// learnt a lot from chrome for developers help page and YT videos
document.getElementById("reset").addEventListener("click", async () =>{
  const day = todayKey();
  const storageKey = `usage:${day}`;
  await chrome.storage.local.remove(storageKey);
  await load();
});

load();
