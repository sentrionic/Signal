import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useChatsQuery } from './useChatsQuery';

export function useCurrentRoute() {
  const route = useRoute();
  const id = ref<string | null>();
  const { chatList } = useChatsQuery();

  watch(
    () => route.params.id,
    (newId) => (id.value = newId.toString()),
    { immediate: true }
  );

  const current = computed(() => {
    if (!id.value) return null;
    return chatList.value.filter((c) => c.id === id.value)[0];
  });

  return {
    id,
    current,
  };
}
