import { useState } from 'react';
import { MediaContent, Comment, sendMessage } from '../../messages';

interface Tweet {
  author: string;
  timestamp: string;
  content: string;
  media?: MediaContent[];
  likes: number;
  retweets: number;
  comments?: Comment[];
}

const MediaRenderer = ({ mediaItems }: { mediaItems?: MediaContent[] }) => {
  if (!mediaItems?.length) return null;
  
  return (
    <>
      {mediaItems.map((media, index) => (
        <div key={index} className="media-container">
          {media.type === 'photo' ? (
            <img src={media.url} alt="Tweet media" />
          ) : media.type === 'video' ? (
            <video src={media.url} controls />
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
      <div className="comments-header">评论 ({comments.length})</div>
      {comments.map((comment, index) => (
        <div key={index} className="comment">
          <div className="author">{comment.author}</div>
          <div className="timestamp">{comment.timestamp}</div>
          <div className="content">{comment.content}</div>
          <MediaRenderer mediaItems={comment.media} />
          <div className="stats">❤️ {comment.likes}</div>
        </div>
      ))}
    </>
  );
};

const TweetContent = ({ tweet }: { tweet: Tweet }) => (
  <>
    <div className="success">✅ 获取成功</div>
    <div className="tweet">
      <div className="author">{tweet.author}</div>
      <div className="timestamp">{tweet.timestamp}</div>
      <div className="content">{tweet.content}</div>
      <MediaRenderer mediaItems={tweet.media} />
      <div className="stats">
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

  const handleScrape = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const pageCount = parseInt(formData.get('pageCount') as string);
      
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) {
        throw new Error('No active tab found');
      }

      const result = await sendMessage('scrapeTweet', pageCount, { tabId: activeTab.id });
      if (result) {
        setTweet(result);
      } else {
        setError('未能找到推文内容');
      }
    } catch (err) {
      setError('获取失败，请确保当前页面是推文页面');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleScrape}>
        <div className="control-group">
          <label className="control-label">选择获取页数</label>
          <select name="pageCount" disabled={loading}>
            <option value="1">1页 (约10条评论)</option>
            <option value="2">2页 (约20条评论)</option>
            <option value="3">3页 (约30条评论)</option>
            <option value="4">4页 (约40条评论)</option>
            <option value="5">5页 (约50条评论)</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '正在获取...' : '获取当前推文内容'}
        </button>
      </form>

      <div className="result">
        {error && <div className="error">❌ {error}</div>}
        {tweet && <TweetContent tweet={tweet} />}
      </div>
    </div>
  );
} 