import { ListPageSkeleton } from "@/components/skeletons";

export default function WatchedLoading() {
  return <ListPageSkeleton label="Loading watched diary" showFeatured={false} />;
}
