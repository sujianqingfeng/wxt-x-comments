import { defineExtensionMessaging } from '@webext-core/messaging';

export interface MediaContent {
  type: 'photo' | 'video';
  url: string;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  media?: MediaContent[];
  likes: number;
}

export interface Tweet {
  author: string;
  timestamp: string;
  content: string;
  media?: MediaContent[];
  likes: number;
  retweets: number;
  bookmark_count: number;
  reply_count: number;
  comments?: Comment[];
}

export type MessageType = 'scrapeTweet';

export interface MessageData {
  scrapeTweet: number;
}

export interface MessageOptions {
  tabId?: number;
}

export function sendMessage<T extends MessageType>(
  type: T,
  data: MessageData[T],
  options?: MessageOptions
): Promise<T extends 'scrapeTweet' ? Tweet : never> {
  if (options?.tabId) {
    return chrome.tabs.sendMessage(options.tabId, { type, data });
  }
  return chrome.runtime.sendMessage({ type, data });
}

export function onMessage<T extends MessageType>(
  type: T,
  callback: (message: { type: T; data: MessageData[T] }) => Promise<T extends 'scrapeTweet' ? Tweet : never>
): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === type) {
      callback(message)
        .then(response => {
          sendResponse(response);
        })
        .catch(error => {
          console.error('Message handler error:', error);
          sendResponse(null);
        });
      return true;
    }
  });
} 