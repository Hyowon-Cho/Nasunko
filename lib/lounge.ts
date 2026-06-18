export type LoungePost = {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  content: string;
  image_url?: string;
  is_owner?: boolean;
};

export type LoungeComment = {
  id: number;
  nickname: string;
  body: string;
  created_at: string;
};

export function createPostId() {
  return `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date())
    .replaceAll(". ", "-")
    .replace(".", "");
}
