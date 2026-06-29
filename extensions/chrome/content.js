// Antigravity Chrome Extension Content Script

// SVG icon for Antigravity (galaxy/star logo)
const ANTIGRAVITY_SVG = `
<svg viewBox="0 0 24 24" class="antigravity-icon-svg" style="width: 18px; height: 18px; fill: rgb(113, 118, 123); transition: fill 0.2s;">
  <path d="M12 2.25a9.75 9.75 0 1 0 9.75 9.75A9.75 9.75 0 0 0 12 2.25zm0 17.5a7.75 7.75 0 1 1 7.75-7.75 7.75 7.75 0 0 1-7.75 7.75zm1.5-11.25h-3v3H9v3h1.5v-3h3v-3zm2-2.5h-7a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1z" />
</svg>
`;

// App deployment domain
const APP_URL = "https://antigravity-five-beta.vercel.app/dashboard";

function injectButtons() {
  // Find all tweet articles on the page
  const tweets = document.querySelectorAll('article[data-testid="tweet"]:not(.antigravity-processed)');

  tweets.forEach((tweet) => {
    // Mark as processed immediately so we don't process it again
    tweet.classList.add('antigravity-processed');

    // Find the action bar (group of icons at the bottom of the tweet)
    const actionBar = tweet.querySelector('div[role="group"]');
    if (!actionBar) return;

    // Find the link to the tweet status to extract URL
    const timeLink = tweet.querySelector('time')?.parentElement;
    if (!timeLink) return;

    const tweetPath = timeLink.getAttribute('href');
    if (!tweetPath || !tweetPath.includes('/status/')) return;

    const tweetUrl = `https://x.com${tweetPath}`;

    // Create the Antigravity custom button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'antigravity-btn-wrapper';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.alignItems = 'center';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.cursor = 'pointer';
    buttonContainer.style.padding = '0 8px';
    buttonContainer.style.borderRadius = '9999px';
    buttonContainer.style.transition = 'background-color 0.2s';
    buttonContainer.setAttribute('title', 'Screenshot with Antigravity');

    buttonContainer.innerHTML = ANTIGRAVITY_SVG;

    // Apply native-like hover effects
    buttonContainer.addEventListener('mouseenter', () => {
      buttonContainer.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
      const svg = buttonContainer.querySelector('svg');
      if (svg) svg.style.fill = 'rgb(139, 92, 246)'; // Antigravity brand violet
    });

    buttonContainer.addEventListener('mouseleave', () => {
      buttonContainer.style.backgroundColor = 'transparent';
      const svg = buttonContainer.querySelector('svg');
      if (svg) svg.style.fill = 'rgb(113, 118, 123)';
    });

    // Handle click event (opens customizer with this tweet url pre-loaded)
    buttonContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      window.open(`${APP_URL}?url=${encodeURIComponent(tweetUrl)}`, '_blank');
    });

    // Inject button before the last item (which is usually the Share or Bookmark button)
    if (actionBar.children.length > 0) {
      const targetIndex = Math.max(0, actionBar.children.length - 1);
      actionBar.insertBefore(buttonContainer, actionBar.children[targetIndex]);
    } else {
      actionBar.appendChild(buttonContainer);
    }
  });
}

// Set up MutationObserver to handle dynamically loaded tweets (infinite scroll)
const observer = new MutationObserver(() => {
  injectButtons();
});

// Start observing the page body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Run initial injection
injectButtons();
