import { useState, useEffect } from 'react';
import { sendMessage } from '../../messages';
import type { MediaContent, Comment } from '../../messages';
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
    <div className="grid grid-cols-2 gap-2 my-3">
      {mediaItems.map((media) => (
        <div key={media.url} className="relative group overflow-hidden rounded-xl bg-gray-100">
          {media.type === 'photo' ? (
            <img src={media.url} alt="Tweet media" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : media.type === 'video' ? (
            <video src={media.url} controls className="w-full rounded-xl" poster={media.url}>
              <track kind="captions" />
            </video>
          ) : null}
        </div>
      ))}
    </div>
  );
};

const CommentList = ({ comments }: { comments?: Comment[] }) => {
  if (!comments?.length) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-gray-700">
        <span className="font-medium">评论</span>
        <span className="px-2 py-0.5 text-sm bg-gray-100 rounded-full">{comments.length}</span>
      </div>
      <div className="space-y-3">
        {comments.map((comment, index) => (
          <div key={`${comment.author}-${comment.timestamp}-${index}`} 
               className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-900">{comment.author}</div>
              <div className="text-sm text-gray-500">{comment.timestamp}</div>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</div>
            <MediaRenderer mediaItems={comment.media} />
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <span>❤️</span>
                <span>{comment.likes.toLocaleString()}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TweetContent = ({ tweet }: { tweet: Tweet }) => (
  <div className="animate-fadeIn">
    <div className="flex items-center gap-2 text-green-600 font-medium mb-4">
      <span className="text-lg">✅</span>
      <span>获取成功</span>
    </div>
    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-gray-900">{tweet.author}</div>
        <div className="text-sm text-gray-500">{tweet.timestamp}</div>
      </div>
      <div className="text-gray-700 whitespace-pre-wrap mb-3">{tweet.content}</div>
      <MediaRenderer mediaItems={tweet.media} />
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span>❤️</span>
          <span>{tweet.likes.toLocaleString()}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span>🔄</span>
          <span>{tweet.retweets.toLocaleString()}</span>
        </span>
      </div>
    </div>
    <CommentList comments={tweet.comments} />
  </div>
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

  const handleExport = () => {
    if (!tweet) {
      setError('没有可导出的推文数据');
      return;
    }

    try {
      const jsonString = JSON.stringify(tweet, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // 使用 chrome.downloads API
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: `tweet-${tweet.timestamp.replace(/[^0-9]/g, '')}.json`,
        saveAs: true
      }, () => {
        URL.revokeObjectURL(url);
        if (chrome.runtime.lastError) {
          console.error('Download error:', chrome.runtime.lastError);
          setError(`导出失败：${chrome.runtime.lastError.message}`);
        } else {
          setError(null);
        }
      });
    } catch (err) {
      setError('导出失败，请重试');
      console.error('Export error:', err);
    }
  };

  return (
    <div className="w-[450px] p-5 font-sans bg-gray-50 min-h-[300px]">
      <form onSubmit={handleScrape} className="mb-6">
        <div className="mb-4">
          <label htmlFor="pageCount" className="block mb-2 font-medium text-gray-700">
            选择获取页数
          </label>
          <select 
            id="pageCount"
            name="pageCount" 
            disabled={loading}
            className="w-full p-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-100"
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
            className="flex-1 p-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>正在获取...</span>
              </span>
            ) : '获取当前推文内容'}
          </button>
          {tweet && (
            <>
              <button 
                type="button"
                onClick={handleExport}
                className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300 transition-colors duration-200"
              >
                导出
              </button>
              <button 
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-colors duration-200"
              >
                清除
              </button>
            </>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <span className="text-lg">❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        {tweet && <TweetContent tweet={tweet} />}
      </div>
    </div>
  );
} 