import { useState, useEffect } from 'react';
import { MediaContent, Comment, sendMessage } from '../../messages';
import { storage } from 'wxt/storage';

interface Tweet {
  author: string;
  timestamp: string;
  content: string;
  media?: MediaContent[];
  likes: number;
  retweets: number;
  comments?: Comment[];
}

const STORAGE_KEY = 'local:savedTweet';

const MediaRenderer = ({ mediaItems }: { mediaItems?: MediaContent[] }) => {
  if (!mediaItems?.length) return null;
  
  return (
    <>
      {mediaItems.map((media, index) => (
        <div key={index} className="my-2 max-w-full">
          {media.type === 'photo' ? (
            <img src={media.url} alt="Tweet media" className="max-w-full rounded" />
          ) : media.type === 'video' ? (
            <video src={media.url} controls className="max-w-full rounded" />
          ) : null}
        </div>
      ))}
    </>
  );
};

const CommentList = ({ comments }: { comments?: Comment[] }) => {
  if (!comments?.length) return null;

  return (
    <>
      <div className="font-semibold my-4 text-gray-900">评论 ({comments.length})</div>
      {comments.map((comment, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded-lg mb-3">
          <div className="font-semibold mb-1">{comment.author}</div>
          <div className="text-sm text-gray-500 mb-2">{comment.timestamp}</div>
          <div className="mb-2 whitespace-pre-wrap">{comment.content}</div>
          <MediaRenderer mediaItems={comment.media} />
          <div className="text-sm text-gray-500">❤️ {comment.likes}</div>
        </div>
      ))}
    </>
  );
};

const TweetContent = ({ tweet }: { tweet: Tweet }) => (
  <>
    <div className="text-green-600 font-semibold mb-3">✅ 获取成功</div>
    <div className="p-3 border border-gray-200 rounded-lg mb-3">
      <div className="font-semibold mb-1">{tweet.author}</div>
      <div className="text-sm text-gray-500 mb-2">{tweet.timestamp}</div>
      <div className="mb-2 whitespace-pre-wrap">{tweet.content}</div>
      <MediaRenderer mediaItems={tweet.media} />
      <div className="text-sm text-gray-500">
        ❤️ {tweet.likes} · 🔄 {tweet.retweets}
      </div>
    </div>
    <CommentList comments={tweet.comments} />
  </>
);

export default function Popup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweet, setTweet] = useState<Tweet | null>(null);

  // Load saved tweet on component mount
  useEffect(() => {
    const loadSavedTweet = async () => {
      const savedTweet = await storage.getItem<Tweet>(STORAGE_KEY);
      if (savedTweet) {
        setTweet(savedTweet);
      }
    };
    loadSavedTweet();
  }, []);

  const handleScrape = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const pageCount = Number.parseInt(formData.get('pageCount') as string);
      
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) {
        throw new Error('No active tab found');
      }

      const result = await sendMessage('scrapeTweet', pageCount, { tabId: activeTab.id });
      if (result) {
        setTweet(result);
        // Save tweet to storage
        await storage.setItem(STORAGE_KEY, result);
      } else {
        setError('未能找到推文内容');
      }
    } catch (err) {
      setError('获取失败，请确保当前页面是推文页面');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await storage.removeItem(STORAGE_KEY);
    setTweet(null);
  };

  return (
    <div className="w-[400px] p-4 font-sans">
      <form onSubmit={handleScrape}>
        <div className="mb-4">
          <label htmlFor="pageCount" className="block mb-2 text-sm text-gray-600">选择获取页数</label>
          <select 
            id="pageCount"
            name="pageCount" 
            disabled={loading}
            className="w-full p-2 border border-gray-300 rounded text-sm mb-3 disabled:bg-gray-100"
          >
            <option value="1">1页 (约10条评论)</option>
            <option value="2">2页 (约20条评论)</option>
            <option value="3">3页 (约30条评论)</option>
            <option value="4">4页 (约40条评论)</option>
            <option value="5">5页 (约50条评论)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 p-2 bg-[#1DA1F2] text-white rounded text-sm hover:bg-[#1a8cd8] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '正在获取...' : '获取当前推文内容'}
          </button>
          {tweet && (
            <button 
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              清除
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 text-sm leading-relaxed text-gray-900">
        {error && <div className="text-red-500 font-semibold">❌ {error}</div>}
        {tweet && <TweetContent tweet={tweet} />}
      </div>
    </div>
  );
} 