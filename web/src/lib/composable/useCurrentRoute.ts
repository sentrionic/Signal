import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useChatsQuery } from './useChatsQuery';

export function useCurrentRoute() {
  const route = useRoute();
  const id = ref<string | null>();
  const { data } = useChatsQuery();

  watch(
    () => route.params.id,
    (newId) => {
      if (newId === undefined) id.value = null;
      else id.value = newId.toString();
    },
    { immediate: true }
  );

  const current = computed(() => {
    if (!id.value) return null;
    return data.value?.filter((c) => c.id === id.value)[0];
  });

  return {
    id,
    current,
  };
}
