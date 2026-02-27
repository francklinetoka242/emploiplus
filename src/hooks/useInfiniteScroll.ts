import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  threshold?: number;
}

/**
 * Custom hook for infinite scroll functionality
 * @param onLoadMore - Callback function to load more data
 * @param threshold - Distance from bottom to trigger load more (in pixels)
 */
export function useInfiniteScroll({
  onLoadMore,
  threshold = 500,
}: UseInfiniteScrollOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!observerTarget.current) return;

    const element = observerTarget.current;
    const rect = element.getBoundingClientRect();

    // Trigger when element is within threshold of viewport bottom
    if (rect.bottom - window.innerHeight < threshold) {
      onLoadMore();
    }
  }, [onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    observerTarget,
    setIsLoading,
    isLoading,
  };
}
