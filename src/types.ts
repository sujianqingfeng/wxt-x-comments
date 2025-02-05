export interface Root {
  data: Data
}

export interface Data {
  threaded_conversation_with_injections_v2: ThreadedConversationWithInjectionsV2
}

export interface ThreadedConversationWithInjectionsV2 {
  instructions: Instruction[]
}

export interface Instruction {
  type: string
  entries?: Entry[]
  direction?: string
}

export interface Entry {
  entryId: string
  sortIndex: string
  content: Content
}

export interface Content {
  entryType: string
  __typename: string
  itemContent?: ItemContent
  items?: Item[]
  displayType?: string
  clientEventInfo?: ClientEventInfo2
}

export interface ItemContent {
  itemType: string
  __typename: string
  value?: string
  cursorType?: string
  tweet_results?: TweetResults
  tweetDisplayType?: string
  hasModeratedReplies?: boolean
}

export interface TweetResults {
  result: Result
}

export interface Result {
  __typename: string
  rest_id: string
  has_birdwatch_notes: boolean
  core: Core
  unmention_data: UnmentionData
  edit_control: EditControl
  is_translatable: boolean
  views: Views
  source: string
  legacy: Legacy2
  quick_promote_eligibility: QuickPromoteEligibility
}

export interface Core {
  user_results: UserResults
}

export interface UserResults {
  result: Result2
}

export interface Result2 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: AffiliatesHighlightedLabel
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy
  professional: Professional
  tipjar_settings: TipjarSettings
  super_follow_eligible: boolean
}

export interface AffiliatesHighlightedLabel {
  label: Label
}

export interface Label {
  url: Url
  badge: Badge
  description: string
  userLabelType: string
  userLabelDisplayType: string
}

export interface Url {
  url: string
  urlType: string
}

export interface Badge {
  url: string
}

export interface Legacy {
  following: boolean
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities
  fast_followers_count: number
  favourites_count: number
  followers_count: number
  friends_count: number
  has_custom_timelines: boolean
  is_translator: boolean
  listed_count: number
  location: string
  media_count: number
  name: string
  normal_followers_count: number
  pinned_tweet_ids_str: string[]
  possibly_sensitive: boolean
  profile_banner_url: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  verified: boolean
  want_retweets: boolean
  withheld_in_countries: any[]
}

export interface Entities {
  description: Description
}

export interface Description {
  urls: any[]
}

export interface Professional {
  rest_id: string
  professional_type: string
  category: any[]
}

export interface TipjarSettings {
  is_enabled: boolean
}

export interface UnmentionData {}

export interface EditControl {
  edit_tweet_ids: string[]
  editable_until_msecs: string
  is_edit_eligible: boolean
  edits_remaining: string
}

export interface Views {
  count: string
  state: string
}

export interface Legacy2 {
  bookmark_count: number
  bookmarked: boolean
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities2
  extended_entities: ExtendedEntities
  favorite_count: number
  favorited: boolean
  full_text: string
  is_quote_status: boolean
  lang: string
  possibly_sensitive: boolean
  possibly_sensitive_editable: boolean
  quote_count: number
  reply_count: number
  retweet_count: number
  retweeted: boolean
  user_id_str: string
  id_str: string
}

export interface Entities2 {
  hashtags: any[]
  media: Medum[]
  symbols: any[]
  timestamps: any[]
  urls: any[]
  user_mentions: any[]
}

export interface Medum {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  source_status_id_str: string
  source_user_id_str: string
  type: string
  url: string
  additional_media_info: AdditionalMediaInfo
  ext_media_availability: ExtMediaAvailability
  sizes: Sizes
  original_info: OriginalInfo
  allow_download_status: AllowDownloadStatus
  video_info: VideoInfo
  media_results: MediaResults
}

export interface AdditionalMediaInfo {
  monetizable: boolean
  source_user: SourceUser
}

export interface SourceUser {
  user_results: UserResults2
}

export interface UserResults2 {
  result: Result3
}

export interface Result3 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: AffiliatesHighlightedLabel2
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy3
  professional: Professional2
  tipjar_settings: TipjarSettings2
  super_follow_eligible: boolean
}

export interface AffiliatesHighlightedLabel2 {}

export interface Legacy3 {
  following: boolean
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities3
  fast_followers_count: number
  favourites_count: number
  followers_count: number
  friends_count: number
  has_custom_timelines: boolean
  is_translator: boolean
  listed_count: number
  location: string
  media_count: number
  name: string
  normal_followers_count: number
  pinned_tweet_ids_str: string[]
  possibly_sensitive: boolean
  profile_banner_url: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  url: string
  verified: boolean
  verified_type: string
  want_retweets: boolean
  withheld_in_countries: any[]
}

export interface Entities3 {
  description: Description2
  url: Url2
}

export interface Description2 {
  urls: any[]
}

export interface Url2 {
  urls: Url3[]
}

export interface Url3 {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

export interface Professional2 {
  rest_id: string
  professional_type: string
  category: Category[]
}

export interface Category {
  id: number
  name: string
  icon_name: string
}

export interface TipjarSettings2 {
  is_enabled: boolean
  bitcoin_handle: string
  ethereum_handle: string
}

export interface ExtMediaAvailability {
  status: string
}

export interface Sizes {
  large: Large
  medium: Medium
  small: Small
  thumb: Thumb
}

export interface Large {
  h: number
  w: number
  resize: string
}

export interface Medium {
  h: number
  w: number
  resize: string
}

export interface Small {
  h: number
  w: number
  resize: string
}

export interface Thumb {
  h: number
  w: number
  resize: string
}

export interface OriginalInfo {
  height: number
  width: number
  focus_rects: any[]
}

export interface AllowDownloadStatus {
  allow_download: boolean
}

export interface VideoInfo {
  aspect_ratio: number[]
  duration_millis: number
  variants: Variant[]
}

export interface Variant {
  content_type: string
  url: string
  bitrate?: number
}

export interface MediaResults {
  result: Result4
}

export interface Result4 {
  media_key: string
}

export interface ExtendedEntities {
  media: Medum2[]
}

export interface Medum2 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  source_status_id_str: string
  source_user_id_str: string
  type: string
  url: string
  additional_media_info: AdditionalMediaInfo2
  ext_media_availability: ExtMediaAvailability2
  sizes: Sizes2
  original_info: OriginalInfo2
  allow_download_status: AllowDownloadStatus2
  video_info: VideoInfo2
  media_results: MediaResults2
}

export interface AdditionalMediaInfo2 {
  monetizable: boolean
  source_user: SourceUser2
}

export interface SourceUser2 {
  user_results: UserResults3
}

export interface UserResults3 {
  result: Result5
}

export interface Result5 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: AffiliatesHighlightedLabel3
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy4
  professional: Professional3
  tipjar_settings: TipjarSettings3
  super_follow_eligible: boolean
}

export interface AffiliatesHighlightedLabel3 {}

export interface Legacy4 {
  following: boolean
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities4
  fast_followers_count: number
  favourites_count: number
  followers_count: number
  friends_count: number
  has_custom_timelines: boolean
  is_translator: boolean
  listed_count: number
  location: string
  media_count: number
  name: string
  normal_followers_count: number
  pinned_tweet_ids_str: string[]
  possibly_sensitive: boolean
  profile_banner_url: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  url: string
  verified: boolean
  verified_type: string
  want_retweets: boolean
  withheld_in_countries: any[]
}

export interface Entities4 {
  description: Description3
  url: Url4
}

export interface Description3 {
  urls: any[]
}

export interface Url4 {
  urls: Url5[]
}

export interface Url5 {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

export interface Professional3 {
  rest_id: string
  professional_type: string
  category: Category2[]
}

export interface Category2 {
  id: number
  name: string
  icon_name: string
}

export interface TipjarSettings3 {
  is_enabled: boolean
  bitcoin_handle: string
  ethereum_handle: string
}

export interface ExtMediaAvailability2 {
  status: string
}

export interface Sizes2 {
  large: Large2
  medium: Medium2
  small: Small2
  thumb: Thumb2
}

export interface Large2 {
  h: number
  w: number
  resize: string
}

export interface Medium2 {
  h: number
  w: number
  resize: string
}

export interface Small2 {
  h: number
  w: number
  resize: string
}

export interface Thumb2 {
  h: number
  w: number
  resize: string
}

export interface OriginalInfo2 {
  height: number
  width: number
  focus_rects: any[]
}

export interface AllowDownloadStatus2 {
  allow_download: boolean
}

export interface VideoInfo2 {
  aspect_ratio: number[]
  duration_millis: number
  variants: Variant2[]
}

export interface Variant2 {
  content_type: string
  url: string
  bitrate?: number
}

export interface MediaResults2 {
  result: Result6
}

export interface Result6 {
  media_key: string
}

export interface QuickPromoteEligibility {
  eligibility: string
}

export interface Item {
  entryId: string
  item: Item2
}

export interface Item2 {
  itemContent: ItemContent2
  clientEventInfo: ClientEventInfo
}

export interface ItemContent2 {
  itemType: string
  __typename: string
  tweet_results?: TweetResults2
  tweetDisplayType?: string
  promotedMetadata?: PromotedMetadata
  value?: string
  cursorType?: string
  displayTreatment?: DisplayTreatment
}

export interface TweetResults2 {
  result: Result7
}

export interface Result7 {
  __typename: string
  tombstone?: Tombstone
  rest_id?: string
  has_birdwatch_notes?: boolean
  core?: Core2
  unmention_data?: UnmentionData2
  edit_control?: EditControl2
  is_translatable?: boolean
  views?: Views2
  source?: string
  note_tweet?: NoteTweet
  legacy?: Legacy7
  quick_promote_eligibility?: QuickPromoteEligibility2
  superFollowsReplyUserResult?: SuperFollowsReplyUserResult
  card?: Card
}

export interface Tombstone {
  __typename: string
  text: Text
}

export interface Text {
  rtl: boolean
  text: string
  entities: Entity[]
}

export interface Entity {
  fromIndex: number
  toIndex: number
  ref: Ref
}

export interface Ref {
  type: string
  url: string
  urlType: string
}

export interface Core2 {
  user_results: UserResults4
}

export interface UserResults4 {
  result: Result8
}

export interface Result8 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: AffiliatesHighlightedLabel4
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy6
  tipjar_settings: TipjarSettings4
  super_follow_eligible?: boolean
  professional?: Professional4
}

export interface AffiliatesHighlightedLabel4 {
  label?: Label2
}

export interface Label2 {
  badge: Badge2
  description: string
  longDescription: LongDescription
  userLabelType: string
}

export interface Badge2 {
  url: string
}

export interface LongDescription {
  text: string
  entities: Entity2[]
}

export interface Entity2 {
  fromIndex: number
  toIndex: number
  ref: Ref2
}

export interface Ref2 {
  type: string
  screen_name: string
  mention_results: MentionResults
}

export interface MentionResults {
  result: Result9
}

export interface Result9 {
  __typename: string
  legacy: Legacy5
  rest_id: string
}

export interface Legacy5 {
  screen_name: string
}

export interface Legacy6 {
  following: boolean
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities5
  fast_followers_count: number
  favourites_count: number
  followers_count: number
  friends_count: number
  has_custom_timelines: boolean
  is_translator: boolean
  listed_count: number
  location: string
  media_count: number
  name: string
  normal_followers_count: number
  pinned_tweet_ids_str: string[]
  possibly_sensitive: boolean
  profile_banner_url?: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  verified: boolean
  want_retweets: boolean
  withheld_in_countries: any[]
  url?: string
  verified_type?: string
}

export interface Entities5 {
  description: Description4
  url?: Url6
}

export interface Description4 {
  urls: any[]
}

export interface Url6 {
  urls: Url7[]
}

export interface Url7 {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

export interface TipjarSettings4 {
  is_enabled?: boolean
}

export interface Professional4 {
  rest_id: string
  professional_type: string
  category: Category3[]
}

export interface Category3 {
  id: number
  name: string
  icon_name: string
}

export interface UnmentionData2 {}

export interface EditControl2 {
  edit_tweet_ids: string[]
  editable_until_msecs: string
  is_edit_eligible: boolean
  edits_remaining: string
}

export interface Views2 {
  count: string
  state: string
}

export interface NoteTweet {
  is_expandable: boolean
  note_tweet_results: NoteTweetResults
}

export interface NoteTweetResults {
  result: Result10
}

export interface Result10 {
  id: string
  text: string
  entity_set: EntitySet
}

export interface EntitySet {
  hashtags: any[]
  symbols: any[]
  urls: any[]
  user_mentions: UserMention[]
  timestamps?: any[]
}

export interface UserMention {
  id_str: string
  name: string
  screen_name: string
  indices: number[]
}

export interface Legacy7 {
  bookmark_count: number
  bookmarked: boolean
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities6
  favorite_count: number
  favorited: boolean
  full_text: string
  in_reply_to_screen_name?: string
  in_reply_to_status_id_str?: string
  in_reply_to_user_id_str?: string
  is_quote_status: boolean
  lang: string
  quote_count: number
  reply_count: number
  retweet_count: number
  retweeted: boolean
  user_id_str: string
  id_str: string
  extended_entities?: ExtendedEntities2
  possibly_sensitive?: boolean
  possibly_sensitive_editable?: boolean
  scopes?: Scopes
}

export interface Entities6 {
  hashtags: any[]
  symbols: any[]
  timestamps: any[]
  urls: any[]
  user_mentions: UserMention2[]
  media?: Medum3[]
}

export interface UserMention2 {
  id_str: string
  name: string
  screen_name: string
  indices: number[]
}

export interface Medum3 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  type: string
  url: string
  ext_media_availability: ExtMediaAvailability3
  features?: Features
  sizes: Sizes3
  original_info: OriginalInfo3
  media_results: MediaResults3
  additional_media_info?: AdditionalMediaInfo3
  allow_download_status?: AllowDownloadStatus3
  video_info?: VideoInfo3
}

export interface ExtMediaAvailability3 {
  status: string
}

export interface Features {
  large: Large3
  medium: Medium3
  small: Small3
  orig: Orig
}

export interface Large3 {
  faces: Face[]
}

export interface Face {
  x: number
  y: number
  h: number
  w: number
}

export interface Medium3 {
  faces: Face2[]
}

export interface Face2 {
  x: number
  y: number
  h: number
  w: number
}

export interface Small3 {
  faces: Face3[]
}

export interface Face3 {
  x: number
  y: number
  h: number
  w: number
}

export interface Orig {
  faces: Face4[]
}

export interface Face4 {
  x: number
  y: number
  h: number
  w: number
}

export interface Sizes3 {
  large: Large4
  medium: Medium4
  small: Small4
  thumb: Thumb3
}

export interface Large4 {
  h: number
  w: number
  resize: string
}

export interface Medium4 {
  h: number
  w: number
  resize: string
}

export interface Small4 {
  h: number
  w: number
  resize: string
}

export interface Thumb3 {
  h: number
  w: number
  resize: string
}

export interface OriginalInfo3 {
  height: number
  width: number
  focus_rects: FocusRect[]
}

export interface FocusRect {
  x: number
  y: number
  w: number
  h: number
}

export interface MediaResults3 {
  result: Result11
}

export interface Result11 {
  media_key: string
}

export interface AdditionalMediaInfo3 {
  monetizable: boolean
}

export interface AllowDownloadStatus3 {
  allow_download: boolean
}

export interface VideoInfo3 {
  aspect_ratio: number[]
  duration_millis: number
  variants: Variant3[]
}

export interface Variant3 {
  content_type: string
  url: string
  bitrate?: number
}

export interface ExtendedEntities2 {
  media: Medum4[]
}

export interface Medum4 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  type: string
  url: string
  ext_media_availability: ExtMediaAvailability4
  features?: Features2
  sizes: Sizes4
  original_info: OriginalInfo4
  media_results: MediaResults4
  additional_media_info?: AdditionalMediaInfo4
  allow_download_status?: AllowDownloadStatus4
  video_info?: VideoInfo4
}

export interface ExtMediaAvailability4 {
  status: string
}

export interface Features2 {
  large: Large5
  medium: Medium5
  small: Small5
  orig: Orig2
}

export interface Large5 {
  faces: Face5[]
}

export interface Face5 {
  x: number
  y: number
  h: number
  w: number
}

export interface Medium5 {
  faces: Face6[]
}

export interface Face6 {
  x: number
  y: number
  h: number
  w: number
}

export interface Small5 {
  faces: Face7[]
}

export interface Face7 {
  x: number
  y: number
  h: number
  w: number
}

export interface Orig2 {
  faces: Face8[]
}

export interface Face8 {
  x: number
  y: number
  h: number
  w: number
}

export interface Sizes4 {
  large: Large6
  medium: Medium6
  small: Small6
  thumb: Thumb4
}

export interface Large6 {
  h: number
  w: number
  resize: string
}

export interface Medium6 {
  h: number
  w: number
  resize: string
}

export interface Small6 {
  h: number
  w: number
  resize: string
}

export interface Thumb4 {
  h: number
  w: number
  resize: string
}

export interface OriginalInfo4 {
  height: number
  width: number
  focus_rects: FocusRect2[]
}

export interface FocusRect2 {
  x: number
  y: number
  w: number
  h: number
}

export interface MediaResults4 {
  result: Result12
}

export interface Result12 {
  media_key: string
}

export interface AdditionalMediaInfo4 {
  monetizable: boolean
}

export interface AllowDownloadStatus4 {
  allow_download: boolean
}

export interface VideoInfo4 {
  aspect_ratio: number[]
  duration_millis: number
  variants: Variant4[]
}

export interface Variant4 {
  content_type: string
  url: string
  bitrate?: number
}

export interface Scopes {
  followers: boolean
}

export interface QuickPromoteEligibility2 {
  eligibility: string
}

export interface SuperFollowsReplyUserResult {
  result: Result13
}

export interface Result13 {
  __typename: string
  legacy: Legacy8
}

export interface Legacy8 {
  screen_name: string
}

export interface Card {
  rest_id: string
  legacy: Legacy9
}

export interface Legacy9 {
  binding_values: BindingValue[]
  card_platform: CardPlatform
  name: string
  url: string
  user_refs_results: any[]
}

export interface BindingValue {
  key: string
  value: Value
}

export interface Value {
  string_value: string
  type: string
  scribe_key?: string
}

export interface CardPlatform {
  platform: Platform
}

export interface Platform {
  audience: Audience
  device: Device
}

export interface Audience {
  name: string
}

export interface Device {
  name: string
  version: string
}

export interface PromotedMetadata {
  advertiser_results: AdvertiserResults
  disclosureType: string
  experimentValues: ExperimentValue[]
  impressionId: string
  impressionString: string
  clickTrackingInfo: ClickTrackingInfo
}

export interface AdvertiserResults {
  result: Result14
}

export interface Result14 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: AffiliatesHighlightedLabel5
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy10
  tipjar_settings: TipjarSettings5
}

export interface AffiliatesHighlightedLabel5 {}

export interface Legacy10 {
  following: boolean
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities7
  fast_followers_count: number
  favourites_count: number
  followers_count: number
  friends_count: number
  has_custom_timelines: boolean
  is_translator: boolean
  listed_count: number
  location: string
  media_count: number
  name: string
  normal_followers_count: number
  pinned_tweet_ids_str: string[]
  possibly_sensitive: boolean
  profile_banner_url: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  url: string
  verified: boolean
  verified_type: string
  want_retweets: boolean
  withheld_in_countries: any[]
}

export interface Entities7 {
  description: Description5
  url: Url8
}

export interface Description5 {
  urls: any[]
}

export interface Url8 {
  urls: Url9[]
}

export interface Url9 {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

export interface TipjarSettings5 {}

export interface ExperimentValue {
  key: string
  value: string
}

export interface ClickTrackingInfo {
  urlParams: UrlParam[]
}

export interface UrlParam {
  key: string
  value: string
}

export interface DisplayTreatment {
  actionText: string
}

export interface ClientEventInfo {
  details: Details
}

export interface Details {
  conversationDetails: ConversationDetails
  timelinesDetails?: TimelinesDetails
}

export interface ConversationDetails {
  conversationSection: string
}

export interface TimelinesDetails {
  controllerData: string
}

export interface ClientEventInfo2 {
  details: Details2
}

export interface Details2 {
  conversationDetails: ConversationDetails2
}

export interface ConversationDetails2 {
  conversationSection: string
}

export interface Tweet {
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  retweets: number;
  bookmark_count: number;
  reply_count: number;
  comments: Comment[];
  media: MediaContent[];
}
