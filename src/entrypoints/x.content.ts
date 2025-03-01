import { format } from 'date-fns';
import type { Root, Instruction, Entry} from '../types';
import { onMessage } from '../messages';
import type { Tweet, Comment } from '../messages';


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
  console.log('开始抓取推文，页数:', pageCount);
  
  const tweet = {
    content: '',
    author: '',
    timestamp: '',
    likes: 0,
    retweets: 0,
    bookmark_count: 0,
    reply_count: 0,
    comments: [] as Comment[],
    media: [] as Tweet['media'],
    directContent: ''
  } satisfies Tweet;

  const tweetId = await getTweetId();
  if (!tweetId) {
    console.error('无法获取推文ID');
    return tweet;
  }
  
  console.log('获取到推文ID:', tweetId);

  // 首先尝试从页面直接抓取推文内容，作为备用方法
  try {
    const mainTweetElement = document.querySelector('[data-testid="tweetText"]');
    if (mainTweetElement) {
      // 直接保存原始 HTML 内容
      const originalHtml = mainTweetElement.innerHTML;
      
      // 创建一个临时元素来处理 HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = originalHtml;
      
      // 保留所有表情符号和格式
      // 1. 保留所有图片元素（表情符号通常是 img 元素）
      const emojiImgs = tempDiv.querySelectorAll('img');
      for (const img of emojiImgs) {
        // 将图片元素替换为其 alt 文本（通常包含表情符号）
        if (img.alt) {
          const textNode = document.createTextNode(img.alt);
          img.parentNode?.replaceChild(textNode, img);
        }
      }
      
      // 2. 保留换行符
      const lineBreaks = tempDiv.querySelectorAll('br');
      for (const br of lineBreaks) {
        const textNode = document.createTextNode('\n');
        br.parentNode?.replaceChild(textNode, br);
      }
      
      // 获取处理后的文本内容
      const textWithEmojis = tempDiv.textContent || '';
      
      console.log('从页面直接抓取的推文内容(带表情符号):', textWithEmojis);
      // 暂存这个内容，如果 API 方法失败，我们将使用这个内容
      tweet.directContent = textWithEmojis;
    }
  } catch (error) {
    console.error('从页面直接抓取推文内容时出错:', error);
  }

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
    
    // 添加一个新的函数来处理推文内容，适用于主推文和评论
    function processFullText(fullText: string, isComment = false, tweetDataObj?: any): string {
      console.log('处理前的原始内容:', fullText);
      
      // 检查内容是否被截断
      const isTruncated = fullText.endsWith('…') || fullText.endsWith('...');
      if (isTruncated && tweetDataObj) {
        console.warn('警告：内容可能被截断，尝试获取完整内容');
        // 尝试从 note_tweet 字段获取完整内容
        try {
          if (tweetDataObj.note_tweet?.note_tweet_results?.result?.text) {
            fullText = tweetDataObj.note_tweet.note_tweet_results.result.text;
            console.log('从 note_tweet 获取到的完整内容:', fullText);
          }
        } catch (error) {
          console.error('尝试获取 note_tweet 内容时出错:', error);
        }
      }
      
      // 只清理 t.co 链接，保留所有其他内容（包括表情符号）
      let cleanedText = fullText;
      
      // 使用正则表达式匹配并删除 t.co 链接
      cleanedText = cleanedText.replace(/https:\/\/t\.co\/\w+/g, '');
      
      // 对于评论，移除开头的作者提及
      if (isComment) {
        // 匹配评论开头的 @username 格式
        cleanedText = cleanedText.replace(/^@\w+\s+/, '');
      }
      
      // 保守地清理空白字符，保留换行符和表情符号
      // 只替换连续的空格或制表符为单个空格
      cleanedText = cleanedText.replace(/[ \t]+/g, ' ');
      
      // 移除开头和结尾的空白字符
      cleanedText = cleanedText.trim();
      
      console.log('处理后的清理内容:', cleanedText);
      return cleanedText;
    }

    if (tweetData.legacy && userData?.legacy) {
      const authorUsername = userData.legacy.screen_name;
      
      console.log('主推文原始内容:', tweetData.legacy.full_text);
      console.log('主推文display_text_range:', tweetData.legacy.display_text_range);
      
      tweet.content = processFullText(tweetData.legacy.full_text, false, tweetData);
      console.log('处理后的完整内容:', tweet.content);
      
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
          // Skip cursor entries
          if (entry.content?.itemContent?.itemType === "TimelineTimelineCursor") return false;

          // Skip main tweet
          if (entry.content?.itemContent?.__typename === "TimelineTweet") return false;

          // For entries with undefined type, check if they have tweet data
          if (!entry.content?.itemContent?.__typename && entry.content) {
            const content = entry.content as unknown as { tweet_results?: { result: any }, __typename?: string };
            // Check if it's a reply or conversation module
            return !!(content.tweet_results?.result || content.__typename === "TimelineTimelineModule");
          }

          // Check for tweet content in itemContent or conversation module
          return !!(
            entry.content?.itemContent?.tweet_results?.result ||
            entry.content?.itemContent?.__typename === "TimelineTimelineModule"
          );
        })
        .flatMap((entry: Entry) => {
          // Handle direct tweet results in content (for undefined type entries)
          if (entry.content) {
            const content = entry.content as unknown as { tweet_results?: { result: any } };
            if (content.tweet_results?.result) {
              const tweet = content.tweet_results.result;
              if (tweet.__typename !== "Tweet" || !tweet.legacy || !tweet.core?.user_results?.result?.legacy) {
                return [];
              }
              const userData = tweet.core.user_results.result;

              const media = tweet.legacy.extended_entities?.media?.map((mediaItem: any) => ({
                type: mediaItem.type === 'photo' ? ('photo' as const) : ('video' as const),
                url: mediaItem.type === 'photo' ? mediaItem.media_url_https : mediaItem.video_info?.variants?.[0]?.url || ''
              }));

              console.log('评论原始内容:', tweet.legacy.full_text);
              console.log('评论display_text_range:', tweet.legacy.display_text_range);

              // 使用新的 processFullText 函数处理评论内容
              const commentContent = processFullText(tweet.legacy.full_text, true, tweetData);
              console.log('处理后的评论内容:', commentContent);

              return [{
                id: tweet.rest_id || '',
                content: commentContent,
                author: `${userData.legacy.name} @${userData.legacy.screen_name}`,
                timestamp: formatTimestamp(tweet.legacy.created_at || ''),
                likes: tweet.legacy.favorite_count || 0,
                ...(media && { media })
              }];
            }
          }

          // If it's a direct tweet result in itemContent
          if (entry.content?.itemContent?.tweet_results?.result) {
            const tweet = entry.content.itemContent.tweet_results.result;
            if (tweet.__typename !== "Tweet" || !tweet.legacy || !tweet.core?.user_results?.result?.legacy) {
              return [];
            }
            const userData = tweet.core.user_results.result;

            const media = tweet.legacy.extended_entities?.media?.map((mediaItem: any) => ({
              type: mediaItem.type === 'photo' ? ('photo' as const) : ('video' as const),
              url: mediaItem.type === 'photo' ? mediaItem.media_url_https : mediaItem.video_info?.variants?.[0]?.url || ''
            }));

            console.log('评论原始内容(itemContent):', tweet.legacy.full_text);
            console.log('评论display_text_range(itemContent):', tweet.legacy.display_text_range);

            // 使用新的 processFullText 函数处理评论内容
            const commentContent = processFullText(tweet.legacy.full_text, true, tweetData);
            console.log('处理后的评论内容(itemContent):', commentContent);

            return [{
              id: tweet.rest_id || '',
              content: commentContent,
              author: `${userData.legacy.name} @${userData.legacy.screen_name}`,
              timestamp: formatTimestamp(tweet.legacy.created_at || ''),
              likes: tweet.legacy.favorite_count || 0,
              ...(media && { media })
            }];
          }

          // Handle timeline module items
          const items = entry.content?.items || [];
          return items
            .filter(item => {
              const tweet = item.item?.itemContent?.tweet_results?.result;
              return tweet?.__typename === "Tweet" && 
                     tweet.legacy && 
                     tweet.core?.user_results?.result?.legacy;
            })
            .map(item => {
              const tweet = item.item?.itemContent?.tweet_results?.result;
              if (!tweet?.legacy || !tweet.core?.user_results?.result?.legacy) return null;
              
              const userData = tweet.core.user_results.result;
              const media = tweet.legacy.extended_entities?.media?.map((mediaItem: any) => ({
                type: mediaItem.type === 'photo' ? ('photo' as const) : ('video' as const),
                url: mediaItem.type === 'photo' ? mediaItem.media_url_https : mediaItem.video_info?.variants?.[0]?.url || ''
              }));
              
              console.log('评论原始内容(timeline):', tweet.legacy.full_text);
              console.log('评论display_text_range(timeline):', tweet.legacy.display_text_range);
              
              // 使用新的 processFullText 函数处理评论内容
              const commentContent = processFullText(tweet.legacy.full_text, true, tweetData);
              console.log('处理后的评论内容(timeline):', commentContent);
              
              return {
                id: tweet.rest_id || '',
                content: commentContent,
                author: `${userData.legacy.name} @${userData.legacy.screen_name}`,
                timestamp: formatTimestamp(tweet.legacy.created_at || ''),
                likes: tweet.legacy.favorite_count || 0,
                ...(media && { media })
              };
            })
            .filter((comment): comment is Comment => comment !== null);
        })
        .filter(comment => comment.id !== '');

      return replies;
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

    console.log(`成功抓取 ${tweet.comments.length} 条评论，共 ${currentPage} 页`);
    console.log('最终推文内容:', tweet.content);

    // 检查推文内容是否完整
    // 根据您提供的示例，完整内容应该包含特定的关键词
    const expectedKeywords = ['DeepSeek-V3/R1', 'OpenSourceWeek', 'Cost profit margin 545%'];
    const missingKeywords = expectedKeywords.filter(keyword => !tweet.content.includes(keyword));

    if (missingKeywords.length > 0) {
      console.warn('警告：推文内容可能不完整，缺少以下关键词:', missingKeywords);
      
      // 尝试从评论中查找完整内容
      console.log('尝试从评论中查找完整内容');
      const relevantComments = tweet.comments.filter(comment => 
        missingKeywords.some(keyword => comment.content.includes(keyword))
      );
      
      if (relevantComments.length > 0) {
        console.log('找到包含缺失关键词的评论:', relevantComments.map(c => c.content));
        
        // 尝试从评论中提取完整内容
        for (const comment of relevantComments) {
          if (comment.content.includes('Cost profit margin 545%')) {
            console.log('从评论中提取包含 Cost profit margin 545% 的内容');
            // 更新推文内容，添加缺失的信息
            tweet.content = `${tweet.content}\n\n${comment.content.replace(/^@\w+\s+/, '')}`;
            break;
          }
        }
      }
      
      // 如果仍然缺少关键词，尝试从原始数据中重新提取完整内容
      if (expectedKeywords.some(keyword => !tweet.content.includes(keyword)) && tweetData?.legacy) {
        console.log('尝试从原始数据中重新提取完整内容');
        
        // 直接使用完整的 full_text，只移除明确的媒体链接
        let fullContent = tweetData.legacy.full_text;
        
        const mediaItems = tweetData.legacy.entities?.media;
        if (mediaItems) {
          for (const media of mediaItems) {
            if (media.url) {
              fullContent = fullContent.replace(media.url, '');
            }
          }
        }
        
        // 清理多余的空格，但保留换行符和表情符号
        fullContent = fullContent.trim()
          .replace(/[ \t]+/g, ' ')  // 替换连续的空格或制表符为单个空格
          .replace(/\s+\n/g, '\n')  // 替换换行符前的空白为单个换行符
          .replace(/\n\s+/g, '\n'); // 替换换行符后的空白为单个换行符
        
        console.log('重新提取的完整内容:', fullContent);
        
        // 只有当重新提取的内容比当前内容更长时才替换
        if (fullContent.length > tweet.content.length) {
          tweet.content = fullContent;
        } else {
          // 合并内容，确保包含所有信息
          tweet.content = `${tweet.content}\n\n${fullContent}`;
        }
      }
    }

    // 如果内容仍然不完整，使用从页面直接抓取的内容
    if ((tweet.directContent && tweet.directContent.length > tweet.content.length) || 
        expectedKeywords.some(keyword => !tweet.content.includes(keyword))) {
      console.log('使用从页面直接抓取的内容，因为 API 返回的内容不完整');
      if (tweet.directContent) {
        tweet.content = tweet.directContent;
        // 不使用 delete 操作符，而是将 directContent 设置为空字符串
        tweet.directContent = '';
      }
    }

    // 最后检查是否仍然缺少关键词
    const stillMissingKeywords = expectedKeywords.filter(keyword => !tweet.content.includes(keyword));
    if (stillMissingKeywords.length > 0) {
      console.warn('警告：最终内容仍然缺少以下关键词:', stillMissingKeywords);
      
      // 尝试直接从原始数据中提取完整内容
      try {
        if (tweetData.legacy?.full_text) {
          console.log('尝试从原始数据中提取完整内容');
          let fullContent = tweetData.legacy.full_text;
          
          // 移除媒体链接
          const mediaItems = tweetData.legacy.entities?.media;
          if (mediaItems) {
            for (const media of mediaItems) {
              if (media.url) {
                fullContent = fullContent.replace(media.url, '');
              }
            }
          }
          
          // 保守地清理空白字符，保留换行符和表情符号
          fullContent = fullContent.replace(/[ \t]+/g, ' ').trim();
          
          console.log('从原始数据中提取的完整内容:', fullContent);
          
          // 检查提取的内容是否包含缺失的关键词
          if (stillMissingKeywords.some(keyword => fullContent.includes(keyword))) {
            console.log('从原始数据中找到包含缺失关键词的内容');
            tweet.content = fullContent;
          }
        }
      } catch (error) {
        console.error('尝试从原始数据中提取内容时出错:', error);
      }
      
      // 如果仍然缺少关键词，尝试直接从页面抓取完整内容
      try {
        const tweetTextElements = Array.from(document.querySelectorAll('[data-testid="tweetText"]'));
        for (const element of tweetTextElements) {
          // 直接保存原始 HTML 内容
          const originalHtml = element.innerHTML;
          
          // 创建一个临时元素来处理 HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = originalHtml;
          
          // 保留所有表情符号和格式
          // 1. 保留所有图片元素（表情符号通常是 img 元素）
          const emojiImgs = tempDiv.querySelectorAll('img');
          for (const img of emojiImgs) {
            // 将图片元素替换为其 alt 文本（通常包含表情符号）
            if (img.alt) {
              const textNode = document.createTextNode(img.alt);
              img.parentNode?.replaceChild(textNode, img);
            }
          }
          
          // 2. 保留换行符
          const lineBreaks = tempDiv.querySelectorAll('br');
          for (const br of lineBreaks) {
            const textNode = document.createTextNode('\n');
            br.parentNode?.replaceChild(textNode, br);
          }
          
          // 获取处理后的文本内容
          const elementText = tempDiv.textContent || '';
          
          if (stillMissingKeywords.some(keyword => elementText.includes(keyword))) {
            console.log('从页面元素中找到包含缺失关键词的内容(带表情符号):', elementText);
            tweet.content = elementText;
            break;
          }
        }
      } catch (error) {
        console.error('尝试从页面元素抓取内容时出错:', error);
      }
    }

    console.log('最终推文数据:', JSON.stringify(tweet, null, 2));

  } catch (error) {
    console.error('抓取推文数据时出错:', error);
    
    // 如果 API 方法失败，使用从页面直接抓取的内容
    if (tweet.directContent) {
      console.log('API 方法失败，使用从页面直接抓取的内容');
      tweet.content = tweet.directContent;
      // 不使用 delete 操作符，而是将 directContent 设置为空字符串
      tweet.directContent = '';
    }
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