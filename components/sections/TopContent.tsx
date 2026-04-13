'use client'

import Image from 'next/image'
import { MetaPost, YouTubeVideo } from '@/types'
import { formatNumber, formatDateDisplay } from '@/lib/utils'
import { ChartCard } from '@/components/ui/ChartCard'
import { TopContentSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface TopContentProps {
  topPosts: MetaPost[] | null
  topVideos: YouTubeVideo[] | null
  postsLoading: boolean
  videosLoading: boolean
  postsError: boolean
  videosError: boolean
}

function PostRow({ post }: { post: MetaPost }) {
  return (
    <div className="flex gap-3 py-3 border-b border-border-subtle last:border-0">
      {post.mediaUrl && (
        <div className="relative h-16 w-16 flex-shrink-0 rounded-badge overflow-hidden bg-border-subtle">
          <Image src={post.mediaUrl} alt="" fill className="object-cover" sizes="64px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary truncate">
          {post.message || '(no caption)'}
        </p>
        <p className="text-xs text-text-muted mt-1">{formatDateDisplay(post.createdTime.split('T')[0])}</p>
        <div className="flex gap-4 mt-1">
          <span className="text-xs font-mono text-accent-primary">
            {formatNumber(post.reach)} reach
          </span>
          <span className="text-xs font-mono text-text-muted">
            ♥ {formatNumber(post.likes)}
          </span>
          <span className="text-xs font-mono text-text-muted">
            💬 {formatNumber(post.comments)}
          </span>
        </div>
      </div>
    </div>
  )
}

function VideoRow({ video }: { video: YouTubeVideo }) {
  return (
    <div className="flex gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="relative h-16 w-28 flex-shrink-0 rounded-badge overflow-hidden bg-border-subtle">
        <Image src={video.thumbnailUrl} alt="" fill className="object-cover" sizes="112px" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary line-clamp-2">{video.title}</p>
        <p className="text-xs text-text-muted mt-1">{formatDateDisplay(video.publishedAt.split('T')[0])}</p>
        <div className="flex gap-4 mt-1">
          <span className="text-xs font-mono text-accent-secondary">
            {formatNumber(video.views)} views
          </span>
          <span className="text-xs font-mono text-text-muted">
            ♥ {formatNumber(video.likes)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TopContent({
  topPosts,
  topVideos,
  postsLoading,
  videosLoading,
  postsError,
  videosError,
}: TopContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {postsLoading ? (
        <TopContentSkeleton />
      ) : (
        <ChartCard title="Top Instagram Posts">
          {postsError || !topPosts?.length ? (
            <EmptyState message="No post data" />
          ) : (
            <div>
              {topPosts.slice(0, 5).map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          )}
        </ChartCard>
      )}

      {videosLoading ? (
        <TopContentSkeleton />
      ) : (
        <ChartCard title="Top YouTube Videos">
          {videosError || !topVideos?.length ? (
            <EmptyState message="No video data" />
          ) : (
            <div>
              {topVideos.slice(0, 5).map((video) => (
                <VideoRow key={video.id} video={video} />
              ))}
            </div>
          )}
        </ChartCard>
      )}
    </div>
  )
}
