interface Tweet {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: Comment[];
}

interface Comment {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
}

async function scrapeTweet(): Promise<Tweet> {
  const tweet: Tweet = {
    content: '',
    author: '',
    timestamp: '',
    likes: 0,
    retweets: 0,
    comments: []
  };

  // Get main tweet content
  const articleElement = document.querySelector('article[data-testid="tweet"]');
  if (articleElement) {
    // Get tweet text
    const tweetTextElement = articleElement.querySelector('[data-testid="tweetText"]');
    tweet.content = tweetTextElement?.textContent?.trim() || '';

    // Get author - now getting both name and handle
    const authorNameElement = articleElement.querySelector('[data-testid="User-Name"]');
    const authorName = authorNameElement?.querySelector('div[dir="ltr"] span span')?.textContent?.trim() || '';
    const authorHandle = authorNameElement?.querySelector('div[dir="ltr"][style*="color: rgb(113, 118, 123)"] span')?.textContent?.trim() || '';
    tweet.author = authorName + ' ' + authorHandle;

    // Get timestamp
    const timeElement = articleElement.querySelector('time');
    tweet.timestamp = timeElement?.getAttribute('datetime') || '';

    // Get engagement stats
    const statsContainer = articleElement.querySelectorAll('[role="group"] [data-testid]');
    statsContainer.forEach(container => {
      const testId = container.getAttribute('data-testid');
      const count = container.querySelector('span[data-testid="app-text-transition-container"] span span')?.textContent || '0';
      
      if (testId === 'like') {
        tweet.likes = parseCount(count);
      } else if (testId === 'retweet') {
        tweet.retweets = parseCount(count);
      }
    });
  }

  // Get comments - looking for articles after the main tweet
  const commentElements = document.querySelectorAll('article[data-testid="tweet"]:not(:first-of-type)');
  commentElements.forEach(commentEl => {
    const comment: Comment = {
      content: commentEl.querySelector('[data-testid="tweetText"]')?.textContent?.trim() || '',
      author: '', // Will be set below
      timestamp: commentEl.querySelector('time')?.getAttribute('datetime') || '',
      likes: parseCount(commentEl.querySelector('[data-testid="like"] span[data-testid="app-text-transition-container"] span span')?.textContent || '0')
    };

    // Get comment author name and handle
    const authorElement = commentEl.querySelector('[data-testid="User-Name"]');
    const authorName = authorElement?.querySelector('div[dir="ltr"] span span')?.textContent?.trim() || '';
    const authorHandle = authorElement?.querySelector('div[dir="ltr"][style*="color: rgb(113, 118, 123)"] span')?.textContent?.trim() || '';
    comment.author = authorName + ' ' + authorHandle;

    tweet.comments.push(comment);
  });

  return tweet;
}

// Helper function to parse counts with K/M suffixes
function parseCount(countStr: string): number {
  if (!countStr) return 0;
  
  const num = countStr.trim();
  if (num.endsWith('K')) {
    return parseFloat(num.replace('K', '')) * 1000;
  } else if (num.endsWith('M')) {
    return parseFloat(num.replace('M', '')) * 1000000;
  }
  return parseInt(num.replace(/,/g, '')) || 0;
}

export default defineContentScript({
  matches: ['*://*.twitter.com/*', '*://*.x.com/*'],
  async main() {
    browser.runtime.onMessage.addListener(async (message) => {
      console.log("🚀 ~ browser.runtime.onMessage.addListener ~ message:", message)
      if (message.type === 'SCRAPE_TWEET') {
        const tweet = await scrapeTweet();
        console.log("🚀 ~ browser.runtime.onMessage.addListener ~ tweet:", tweet)
        return { data: tweet };
      }
    });
  }
}); 