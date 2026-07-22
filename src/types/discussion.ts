import { Profile } from './checkin';

export type DiscussionCategory = 'troubleshooting' | 'hardware' | 'tips' | 'general';

export interface DiscussionPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: DiscussionCategory;
  image_url?: string;
  image_urls?: string[];  // Support up to 3 images
  upvotes_count: number;
  is_dummy: boolean;
  created_at: string;
  profiles?: Profile;
  comments_count?: number;
  user_has_upvoted?: boolean;
}

export interface DiscussionComment {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  is_dummy: boolean;
  created_at: string;
  profiles?: Profile;
}
