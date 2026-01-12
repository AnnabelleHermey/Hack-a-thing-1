# ⏱️ Time on Site (Today)

A Chrome Extension that tracks how much time you spend on each website per day and shows a live summary in a popup. This tool is designed to help users better understand their browsing habits and where their time actually goes. I wanted this specifcally because the apple screentime report for Macs just says Google Chrome and not actually where you are spending your time, so its harder to quantify accountability. So while this doesn't tie into any of my best ideas for this class, it does solve a problem that I has been bothering me for a while. I also made it so that once you spen twenty minutes on a site, it redirects you to take a break. This was an extra feature I added because I use a Pomodoro Chrome Extension and sometimes I see the timer run out and shrug it off just to loose focus in two minutes for thirty minutes. This feature, which took me over the 10 hours to make this project, would fix this issue because it pulls you out of the site. I also chose this project because while I have done web and app dev, I have never made a Chrome extension and I love Chrome extensions (I have at least 20). I wanted to do this project to not only learn how to make Chrome extensions but also how to user their API and do some backgorund service work and store it in a way I could reference later. 

---

## Features

- Tracks time spent on each domain (e.g. google.com, instagram.com)
- Displays:
  - Total time spent today
  - Top websites by time
- Automatically resets each day
- One-click Reset Today button
- Data is stored locally in Chrome using `chrome.storage`

---

## How It Works

The extension uses a "background service worker" to:
1. Detect when the active browser tab changes
2. Read the domain of the active website
3. Measure how long the user stays on that domain
4. Save the time data to Chrome’s local storage

The popup UI then reads this stored data and displays a ranked list of the most-used sites for the current day.

---

## How to Install & Run

1. Download or clone this repository
2. Open Chrome and go to:  
   `chrome://extensions`
3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the project folder
6. Pin the extension to your toolbar
7. Browse normally takes a minute or two to kick in — click the extension icon to see your time breakdown

---

## Example Use

After browsing for a while, clicking the extension might show something like:

- canvas.dartmouth.edu – 42 minutes  
- google.com – 18 minutes  
- instagram.com – 11 minutes  

Total: 1 hour 11 minutes

---

## What I Learned

- How Chrome Extensions work using Manifest V3
- How to use:
  - `chrome.tabs`
  - `chrome.windows`
  - `chrome.storage`
- How to build a background service worker that runs even when the popup is closed
- How to design a simple popup UI using HTML, CSS, and JavaScript

---

## Limitations

- Time is only counted while a Chrome window is in focus 
- Only counts for the user that has the extension installed
- Data is stored locally and is not synced across devices
- Currently only tracks per-day usage (no weekly/monthly view yet)

---

## Credits & Citations

This project was built with the help of online resources, which are cited below in accordance with the course Academic Honor Principle.

I used ChatGPT to help scaffold and understand the structure of a Chrome Extension (Manifest V3), including:
- How to structure `manifest.json`
- How to use a background service worker
- How to store data using `chrome.storage`
- How to build a popup UI with `popup.html` and `popup.js`
- For help writing this file

I also referenced the following tutorials to understand Chrome Extension development and APIs:

- *How to Make a Chrome Extension*  
  https://www.youtube.com/watch?v=60MRE4qb8PU  

- *How to Make a Chrome Extension (Bob Ross)*  
  https://www.youtube.com/watch?v=Zt_6UXvoKHM  

- *Chrome Extensions Reference API*  
  https://developer.chrome.com/docs/extensions/reference/api/storage 

These resources were used for learning and guidance.  
All code in this repository was written and adapted specifically for this project.
