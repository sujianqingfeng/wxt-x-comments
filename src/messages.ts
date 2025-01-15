import { defineExtensionMessaging } from '@webext-core/messaging';

export interface MediaContent {
  type: 'photo' | 'video';
  url: string;
}

export interface Tweet {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: Comment[];
  media?: MediaContent[];
}

export interface Comment {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  media?: MediaContent[];
}

interface MessagingProtocol {
  scrapeTweet(pageCount: number): Tweet;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<MessagingProtocol>(); 