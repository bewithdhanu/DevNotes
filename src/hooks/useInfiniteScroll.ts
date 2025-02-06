import { useCallback } from 'react';

export const useInfiniteScroll = (onLoadMore: (increment: number) => void) => {
  return useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Load more when user scrolls to bottom (with 100px threshold)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore(1);
    }
  }, [onLoadMore]);
}; 