import { redirect } from "next/navigation";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const query = params.category ? `?category=${encodeURIComponent(params.category)}` : "";
  redirect(`/feed${query}`);
}
