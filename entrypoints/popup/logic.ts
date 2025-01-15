import { MediaContent, Comment, sendMessage } from '../../messages';

const button = document.getElementById('scrapeButton') as HTMLButtonElement;
const resultDiv = document.getElementById('result') as HTMLDivElement;
const pageCountSelect = document.getElementById('pageCount') as HTMLSelectElement;

function renderMedia(mediaItems?: MediaContent[]) {
    if (!mediaItems?.length) return '';
    return mediaItems.map(media => {
        if (media.type === 'photo') {
            return `<div class="media-container">
                <img src="${media.url}" alt="Tweet media" />
            </div>`;
        } else if (media.type === 'video') {
            return `<div class="media-container">
                <video src="${media.url}" controls></video>
            </div>`;
        }
        return '';
    }).join('');
}

function renderComments(comments?: Comment[]) {
    if (!comments?.length) return '';
    return `
        <div class="comments-header">评论 (${comments.length})</div>
        ${comments.map(comment => `
            <div class="comment">
                <div class="author">${comment.author}</div>
                <div class="timestamp">${comment.timestamp}</div>
                <div class="content">${comment.content}</div>
                ${renderMedia(comment.media)}
                <div class="stats">❤️ ${comment.likes}</div>
            </div>
        `).join('')}
    `;
}

button.addEventListener('click', async () => {
    try {
        button.disabled = true;
        button.textContent = '正在获取...';
        resultDiv.textContent = '';

        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!activeTab?.id) {
            throw new Error('No active tab found');
        }
        const pageCount = parseInt(pageCountSelect.value);
        const tweet = await sendMessage('scrapeTweet', pageCount, { tabId: activeTab.id });
        
        if (tweet) {
            resultDiv.innerHTML = `
                <div class="success">✅ 获取成功</div>
                <div class="tweet">
                    <div class="author">${tweet.author}</div>
                    <div class="timestamp">${tweet.timestamp}</div>
                    <div class="content">${tweet.content}</div>
                    ${renderMedia(tweet.media)}
                    <div class="stats">
                        ❤️ ${tweet.likes} · 🔄 ${tweet.retweets}
                    </div>
                </div>
                ${renderComments(tweet.comments)}
            `;
        } else {
            resultDiv.innerHTML = '<div class="error">❌ 未能找到推文内容</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">❌ 获取失败，请确保当前页面是推文页面</div>';
    } finally {
        button.disabled = false;
        button.textContent = '获取当前推文内容';
    }
}); 