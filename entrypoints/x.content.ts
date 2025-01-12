import { format, parseISO } from 'date-fns';
import type { Root, Instruction, Entry } from '../types';

interface MediaContent {
  type: 'photo' | 'video';
  url: string;
}

interface Tweet {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: Comment[];
  media?: MediaContent[];
}

interface Comment {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  media?: MediaContent[];
}

// Additional type for promoted content
interface PromotedMetadata {
  advertiser_results: any;
  disclosureType: string;
  experimentValues: any[];
  impressionId: string;
  impressionString: string;
  clickTrackingInfo: any;
}

interface ItemContent {
  itemType: string;
  __typename: string;
  tweet_results?: {
    result: any;
  };
  promotedMetadata?: PromotedMetadata;
}

// Use the imported Root type
type TwitterApiResponse = Root;

// Function to format timestamp
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return format(date, 'yyyy-MM-dd HH:mm');
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
}

async function getTweetId(): Promise<string> {
  const url = window.location.href;
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : '';
}

async function scrapeTweet(pageCount: number = 1): Promise<Tweet> {
  const tweet: Tweet = {
    content: '',
    author: '',
    timestamp: '',
    likes: 0,
    retweets: 0,
    comments: []
  };

  const tweetId = await getTweetId();
  if (!tweetId) return tweet;

  try {
    // Function to make API request with cursor
    async function fetchTweetData(cursor?: string): Promise<TwitterApiResponse> {
      // Prepare GraphQL query parameters
      const variables = {
        "focalTweetId": tweetId,
        "cursor": cursor,
        "with_rux_injections": false,
        "rankingMode": "Relevance",
        "includePromotedContent": true,
        "withCommunity": true,
        "withQuickPromoteEligibilityTweetFields": true,
        "withBirdwatchNotes": true,
        "withVoice": true
      };

      const features = {
        "profile_label_improvements_pcf_label_in_post_enabled": true,
        "rweb_tipjar_consumption_enabled": true,
        "responsive_web_graphql_exclude_directive_enabled": true,
        "verified_phone_label_enabled": false,
        "creator_subscriptions_tweet_preview_api_enabled": true,
        "responsive_web_graphql_timeline_navigation_enabled": true,
        "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
        "premium_content_api_read_enabled": false,
        "communities_web_enable_tweet_community_results_fetch": true,
        "c9s_tweet_anatomy_moderator_badge_enabled": true,
        "responsive_web_grok_analyze_button_fetch_trends_enabled": false,
        "responsive_web_grok_analyze_post_followups_enabled": true,
        "responsive_web_grok_share_attachment_enabled": true,
        "articles_preview_enabled": true,
        "responsive_web_edit_tweet_api_enabled": true,
        "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
        "view_counts_everywhere_api_enabled": true,
        "longform_notetweets_consumption_enabled": true,
        "responsive_web_twitter_article_tweet_consumption_enabled": true,
        "tweet_awards_web_tipping_enabled": false,
        "creator_subscriptions_quote_tweet_preview_enabled": false,
        "freedom_of_speech_not_reach_fetch_enabled": true,
        "standardized_nudges_misinfo": true,
        "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
        "rweb_video_timestamps_enabled": true,
        "longform_notetweets_rich_text_read_enabled": true,
        "longform_notetweets_inline_media_enabled": true,
        "responsive_web_enhance_cards_enabled": false
      };

      const fieldToggles = {
        "withArticleRichContentState": true,
        "withArticlePlainText": false,
        "withGrokAnalyze": false,
        "withDisallowedReplyControls": false
      };

      const graphqlUrl = `https://x.com/i/api/graphql/LG_-V6iikp5XQKoH1tSg6A/TweetDetail?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`;

      // Get the ct0 cookie value for CSRF token
      const cookies = document.cookie.split('; ');
      const ct0Cookie = cookies.find(cookie => cookie.startsWith('ct0='))?.split('=')[1];

      if (!ct0Cookie) {
        throw new Error('Required ct0 cookie not found. Please log in to X first.');
      }

      // Make the API request using XHR
      const xhr = new XMLHttpRequest();
      xhr.open('GET', graphqlUrl, true);
      xhr.setRequestHeader('accept', '*/*');
      xhr.setRequestHeader('accept-language', 'en-US,en;q=0.9');
      xhr.setRequestHeader('authorization', 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA');
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.setRequestHeader('x-csrf-token', ct0Cookie);
      xhr.setRequestHeader('x-twitter-active-user', 'yes');
      xhr.setRequestHeader('x-twitter-auth-type', 'OAuth2Session');
      xhr.setRequestHeader('x-twitter-client-language', 'en');
      xhr.setRequestHeader('Referer', 'https://x.com/');
      xhr.setRequestHeader('Origin', 'https://x.com');
      xhr.withCredentials = true;

      return new Promise((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };
        xhr.onerror = function() {
          reject(new Error('Network error occurred'));
        };
        xhr.send();
      });
    }

    // Fetch first page
    const firstPageResponse = await fetchTweetData();
    
    // Parse main tweet data from first page
    const instructions = firstPageResponse.data.threaded_conversation_with_injections_v2.instructions;
    const mainInstruction = instructions.find((instruction: Instruction) => instruction.type === "TimelineAddEntries");
    
    if (!mainInstruction?.entries?.length) {
      throw new Error('No tweet data found');
    }

    // Get main tweet
    const mainTweetEntry = mainInstruction.entries.find((entry: Entry) => {
      const tweetResults = entry.content?.itemContent?.tweet_results;
      return tweetResults?.result?.rest_id === tweetId;
    });

    if (!mainTweetEntry?.content?.itemContent?.tweet_results?.result) {
      throw new Error('Main tweet not found');
    }

    const tweetData = mainTweetEntry.content.itemContent.tweet_results.result;
    const userData = tweetData.core?.user_results?.result;
    
    // Function to clean tweet content by removing t.co URLs and author mentions
    function cleanTweetContent(content: string, isComment: boolean = false, authorUsername?: string): string {
      // Remove t.co URLs
      let cleanContent = content.replace(/\s*https:\/\/t\.co\/\w+/g, '');
      
      // For comments, remove mention of the original tweet author at the beginning
      if (isComment && authorUsername) {
        const authorMentionRegex = new RegExp(`^@${authorUsername}\\s*`);
        cleanContent = cleanContent.replace(authorMentionRegex, '');
      }
      
      return cleanContent.trim();
    }

    if (tweetData.legacy && userData?.legacy) {
      const authorUsername = userData.legacy.screen_name;
      tweet.content = cleanTweetContent(tweetData.legacy.full_text);
      tweet.author = `${userData.legacy.name} @${authorUsername}`;
      tweet.timestamp = formatTimestamp(tweetData.legacy.created_at);
      tweet.likes = tweetData.legacy.favorite_count;
      tweet.retweets = tweetData.legacy.retweet_count;
      
      // Parse media content for main tweet
      if (tweetData.legacy.extended_entities?.media) {
        tweet.media = tweetData.legacy.extended_entities.media.map(media => ({
          type: media.type === 'photo' ? 'photo' : 'video',
          url: media.type === 'photo' ? media.media_url_https : media.video_info?.variants?.[0]?.url || ''
        }));
      }
    }

    // Function to parse replies from instruction
    function parseReplies(instruction: Instruction): Comment[] {
      if (!instruction.entries) return [];
      
      const replies = instruction.entries
        .filter((entry: Entry) => {
          if (!entry.content) return false;
          
          const items = entry.content.items || [{ item: { itemContent: entry.content.itemContent } }];
          
          return items.some(item => {
            const itemContent = item.item?.itemContent as ItemContent;
            if (itemContent?.promotedMetadata) return false;
            if (!itemContent?.tweet_results?.result) return false;
            
            const tweetResults = itemContent.tweet_results.result;
            return tweetResults.rest_id !== tweetId && 
                   tweetResults.legacy && 
                   tweetResults.core?.user_results?.result?.legacy;
          });
        });

      return replies.flatMap((entry: Entry) => {
        const items = entry.content?.items || [{ item: { itemContent: entry.content?.itemContent } }];
        return items
          .filter(item => {
            const itemContent = item.item?.itemContent as ItemContent;
            if (itemContent?.promotedMetadata) return false;
            return itemContent?.tweet_results?.result;
          })
          .map(item => {
            const replyData = item.item?.itemContent?.tweet_results?.result;
            const replyUserData = replyData?.core?.user_results?.result;
            
            const comment: Comment = {
              content: cleanTweetContent(replyData?.legacy?.full_text || '', true, userData?.legacy?.screen_name),
              author: replyUserData?.legacy ? `${replyUserData.legacy.name} @${replyUserData.legacy.screen_name}` : '',
              timestamp: formatTimestamp(replyData?.legacy?.created_at || ''),
              likes: replyData?.legacy?.favorite_count || 0
            };

            // Parse media content for comments
            if (replyData?.legacy?.extended_entities?.media) {
              comment.media = replyData.legacy.extended_entities.media.map(media => ({
                type: media.type === 'photo' ? 'photo' : 'video',
                url: media.type === 'photo' ? media.media_url_https : media.video_info?.variants?.[0]?.url || ''
              }));
            }

            return comment;
          });
      });
    }

    // Get first page replies
    const firstPageReplies = parseReplies(mainInstruction);
    tweet.comments = firstPageReplies;

    // Fetch additional pages if requested
    let currentCursor = null;
    let currentPage = 1;

    while (currentPage < pageCount) {
      // Find cursor for next page
      const cursorEntry = mainInstruction.entries?.find((entry: Entry) => {
        if (!entry.content?.itemContent) return false;
        return (
          entry.content.itemContent.itemType === "TimelineTimelineCursor" &&
          entry.content.itemContent.__typename === "TimelineTimelineCursor" &&
          entry.content.itemContent.cursorType === "Bottom"
        );
      });
      
      currentCursor = cursorEntry?.content?.itemContent?.value;
      
      if (!currentCursor) {
        console.log("No more pages available");
        break;
      }

      // Wait before making the next request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch next page
      const nextPageResponse = await fetchTweetData(currentCursor);
      const nextPageInstruction = nextPageResponse.data.threaded_conversation_with_injections_v2.instructions
        .find((instruction: Instruction) => instruction.type === "TimelineAddEntries");
      
      if (nextPageInstruction) {
        const nextPageReplies = parseReplies(nextPageInstruction);
        tweet.comments = [...tweet.comments, ...nextPageReplies];
      }

      currentPage++;
    }

    console.log("Parsed tweet:", tweet);
    console.log(`Total replies found: ${tweet.comments.length} from ${currentPage} pages`);

  } catch (error) {
    console.error('Error fetching tweet data:', error);
  }

  return tweet;
}

export default defineContentScript({
  matches: ['*://*.twitter.com/*', '*://*.x.com/*'],
  async main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'SCRAPE_TWEET') {
        // Return a promise that resolves with the data
        return (async () => {
          const tweet = await scrapeTweet(message.pageCount || 1);
          console.log("Tweet data:", tweet);
          return { data: tweet };
        })();
      }
      return false;
    });
  }
}); 