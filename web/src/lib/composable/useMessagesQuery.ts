import { ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { getMessages } from '../api/handler/messages';

export const mKey = 'mKey';

export function useMessagesQuery(chatId: string) {
  const hasMore = ref<boolean>(true);

  const { data, isLoading, fetchNextPage } = useInfiniteQuery(
    [mKey, chatId],
    async ({ pageParam = null }) => {
      const response = await getMessages(chatId, pageParam);
      if (response.length !== 35) hasMore.value = false;
      return response;
    },
    {
      staleTime: 0,
      cacheTime: 0,
      getNextPageParam: (lastPage) =>
        hasMore.value && lastPage.length ? lastPage[lastPage.length - 1].sentAt : '',
    }
  );

  return {
    data,
    isLoading,
    fetchNextPage,
    hasMore,
  };
}
