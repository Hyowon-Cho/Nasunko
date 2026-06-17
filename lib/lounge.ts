export type LoungePost = {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  content: string;
};

export const loungePosts: LoungePost[] = [];

export function getLoungePost(id: string) {
  return loungePosts.find((post) => post.id === id);
}

export const LOUNGE_STORAGE_KEY = "naseonko:lounge-posts";

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
