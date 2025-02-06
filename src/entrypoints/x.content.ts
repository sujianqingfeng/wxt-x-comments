import { format } from 'date-fns';
import type { Root, Instruction, Entry, ItemContent2 } from '../types';
import { onMessage } from '../messages';
import type { Tweet, Comment } from '../messages';

interface Item {
  item: {
    itemContent?: ItemContent2;
    clientEventInfo?: {
      details?: {
        timelinesDetails?: {
          controllerData?: string;
        };
        conversationDetails?: {
          conversationSection?: string;
        };
      };
    };
  };
}

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

async function scrapeTweet(pageCount = 1) {
  const tweet = {
    content: '',
    author: '',
    timestamp: '',
    likes: 0,
    retweets: 0,
    bookmark_count: 0,
    reply_count: 0,
    comments: [] as Comment[],
    media: [] as Tweet['media']
  } satisfies Tweet;

  const tweetId = await getTweetId();
  if (!tweetId) return tweet;

  try {
    // Function to make API request with cursor
    async function fetchTweetData(cursor?: string): Promise<Root> {
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
      xhr.withCredentials = true;

      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };
        xhr.onerror = () => {
          reject(new Error('Network error occurred'));
        };
        xhr.send();
      });
    }

    // Fetch first page
    const firstPageResponse = await fetchTweetData();
    
    // Parse main tweet data from first page
    const instructions = firstPageResponse.data.threaded_conversation_with_injections_v2.instructions;
    let mainInstruction = instructions.find((instruction: Instruction) => instruction.type === "TimelineAddEntries");
    
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
    function cleanTweetContent(content: string, isComment = false, authorUsername?: string) {
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
      tweet.bookmark_count = tweetData.legacy.bookmark_count || 0;
      tweet.reply_count = tweetData.legacy.reply_count || 0;
      
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
          if (!entry.content?.itemContent) return false;

          // Skip cursor entries
          if (entry.content.itemContent.itemType === "TimelineTimelineCursor") return false;

          // Skip non-conversation entries
          const conversationSection = entry.content?.clientEventInfo?.details?.conversationDetails?.conversationSection;
          if (conversationSection && !['tweet', 'reply', 'HighQuality'].includes(conversationSection)) return false;
          
          const itemContent = entry.content.itemContent as ItemContent2;
          
          // Skip ads and invalid tweets
          if ('promotedMetadata' in itemContent || !itemContent.tweet_results?.result) return false;
          
          const tweetResults = itemContent.tweet_results.result;
          
          // Skip invalid tweets and main tweet
          return tweetResults.__typename === "Tweet" && 
                 tweetResults.rest_id !== tweetId && 
                 tweetResults.legacy && 
                 tweetResults.core?.user_results?.result?.legacy;
        });

      return replies.map((entry: Entry) => {
        const itemContent = entry.content?.itemContent as ItemContent2;
        if (!itemContent?.tweet_results?.result) {
          return {
            id: '',
            content: '',
            author: '',
            timestamp: '',
            likes: 0
          };
        }

        const tweetResults = itemContent.tweet_results.result;
        const userData = tweetResults.core?.user_results?.result;
        
        const comment: Comment = {
          id: tweetResults.rest_id || '',
          content: cleanTweetContent(tweetResults.legacy?.full_text || '', true, userData?.legacy?.screen_name),
          author: userData?.legacy ? `${userData.legacy.name} @${userData.legacy.screen_name}` : '',
          timestamp: formatTimestamp(tweetResults.legacy?.created_at || ''),
          likes: tweetResults.legacy?.favorite_count || 0
        };

        // Parse media content for comments
        if (tweetResults.legacy?.extended_entities?.media) {
          comment.media = tweetResults.legacy.extended_entities.media.map(media => ({
            type: media.type === 'photo' ? 'photo' : 'video',
            url: media.type === 'photo' ? media.media_url_https : media.video_info?.variants?.[0]?.url || ''
          }));
        }

        return comment;
      }).filter(comment => comment.id !== ''); // Filter out invalid comments
    }

    // Get first page replies
    const firstPageReplies = parseReplies(mainInstruction);
    tweet.comments = firstPageReplies;

    // Track unique comment IDs
    const seenCommentIds = new Set(firstPageReplies.map(comment => comment.id));

    // Fetch additional pages if requested
    let currentCursor = null;
    let currentPage = 1;

    while (currentPage < pageCount) {
      const cursorEntry = mainInstruction.entries?.find((entry: Entry) => 
        entry.content?.itemContent?.itemType === "TimelineTimelineCursor" &&
        entry.content.itemContent.__typename === "TimelineTimelineCursor" &&
        entry.content.itemContent.cursorType === "Bottom"
      );
      
      currentCursor = cursorEntry?.content?.itemContent?.value;
      if (!currentCursor) break;

      // Wait before making the next request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch next page
      const nextPageResponse = await fetchTweetData(currentCursor);
      const nextPageInstruction = nextPageResponse.data.threaded_conversation_with_injections_v2.instructions
        .find((instruction: Instruction) => instruction.type === "TimelineAddEntries");
      
      if (nextPageInstruction) {
        const nextPageReplies = parseReplies(nextPageInstruction);
        
        // Filter out duplicates before adding to tweet.comments
        const uniqueNewReplies = nextPageReplies.filter(comment => {
          if (seenCommentIds.has(comment.id)) return false;
          seenCommentIds.add(comment.id);
          return true;
        });
        tweet.comments = [...tweet.comments, ...uniqueNewReplies];

        // Update mainInstruction for next iteration to get new cursor
        mainInstruction = nextPageInstruction;
      } else {
        break;
      }

      currentPage++;
    }

    console.log(`Successfully fetched ${tweet.comments.length} comments from ${currentPage} pages`);

  } catch (error) {
    console.error('Error fetching tweet data:', error);
  }

  return tweet;
}

export default defineContentScript({
  matches: ['*://*.x.com/*'],
  async main() {
    onMessage('scrapeTweet', async (message) => {
      const tweet = await scrapeTweet(message.data);
      return tweet;
    });
  }
}); 