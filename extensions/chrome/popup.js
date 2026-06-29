const APP_URL = "https://antigravity-five-beta.vercel.app/dashboard";

document.addEventListener('DOMContentLoaded', async () => {
  const captureBtn = document.getElementById('capture-btn');

  // Get active tab URL
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url) {
      captureBtn.textContent = "Open Studio Dashboard";
      captureBtn.addEventListener('click', () => {
        window.open(APP_URL, '_blank');
      });
      return;
    }

    const url = tab.url;
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');
    const isStatus = url.includes('/status/');

    if (isTwitter && isStatus) {
      captureBtn.textContent = "Customize Current Tweet";
      captureBtn.addEventListener('click', () => {
        window.open(`${APP_URL}?url=${encodeURIComponent(url)}`, '_blank');
      });
    } else {
      captureBtn.textContent = "Open Studio Dashboard";
      captureBtn.addEventListener('click', () => {
        window.open(APP_URL, '_blank');
      });
    }
  } catch (err) {
    console.error("Failed to query tabs:", err);
    captureBtn.textContent = "Open Studio Dashboard";
    captureBtn.addEventListener('click', () => {
      window.open(APP_URL, '_blank');
    });
  }
});
