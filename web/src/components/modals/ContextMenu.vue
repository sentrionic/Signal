<script setup lang="ts">
import type { ContextMenuItem, ContextMenuSelection } from '@/lib/models/context-menu';
import { onClickOutside } from '@vueuse/core';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{ elementId: string; options: ContextMenuItem[] }>();

const emit = defineEmits<{
  (event: 'option-clicked', selection: ContextMenuSelection): void;
}>();

const target = ref(null);
const item = ref<string | null>(null);
const menuHeight = ref<number | null>(null);
const menuWidth = ref<number | null>(null);

const showMenu = (event: MouseEvent, selected: string) => {
  item.value = selected;

  const menu = document.getElementById(props.elementId);
  if (!menu) {
    return;
  }

  if (!menuWidth.value || !menuHeight.value) {
    menu.style.visibility = 'hidden';
    menu.style.display = 'block';
    menuWidth.value = menu.offsetWidth;
    menuHeight.value = menu.offsetHeight;
    menu.removeAttribute('style');
  }

  if (menuWidth.value + event.pageX >= window.innerWidth) {
    menu.style.left = event.pageX - menuWidth.value + 2 + 'px';
  } else {
    menu.style.left = event.pageX - 2 + 'px';
  }

  if (menuHeight.value + event.pageY >= window.innerHeight) {
    menu.style.top = event.pageY - menuHeight.value + 2 + 'px';
  } else {
    menu.style.top = event.pageY - menuHeight.value + 'px';
  }

  menu.classList.add('vue-simple-context-menu--active');
};

const hideContextMenu = () => {
  const element = document.getElementById(props.elementId);
  if (element) {
    element.classList.remove('vue-simple-context-menu--active');
  }
};

onClickOutside(target, (_) => hideContextMenu());

const optionClicked = (option: ContextMenuItem) => {
  hideContextMenu();
  emit('option-clicked', { value: item.value ?? '', option });
};

const onEscKeyRelease = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    hideContextMenu();
  }
};

onMounted(() => {
  document.body.addEventListener('keyup', onEscKeyRelease);
});

onUnmounted(() => {
  document.removeEventListener('keyup', onEscKeyRelease);
});

defineExpose({
  showMenu,
});
</script>

<template>
  <Transition>
    <div ref="target">
      <ul :id="elementId" class="vue-simple-context-menu">
        <li
          v-for="(option, index) in options"
          :key="index"
          @click.stop="optionClicked(option)"
          :class="
            option.isDestructive
              ? 'vue-simple-context-menu__item-destructive'
              : 'vue-simple-context-menu__item'
          "
        >
          <component :is="option.icon" class="w-5 h-5 mr-3" />
          <span v-html="option.name"></span>
        </li>
      </ul>
    </div>
  </Transition>
</template>

<style lang="css">
.vue-simple-context-menu {
  background-color: #ecf0f1;
  border-bottom-width: 0px;
  border-radius: 4px;
  box-shadow: 0 3px 6px 0 rgba(#333, 0.2);
  display: none;
  left: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  z-index: 1000000;
}

.vue-simple-context-menu--active {
  display: block;
}

.vue-simple-context-menu__item {
  align-items: center;
  color: #333;
  cursor: pointer;
  display: flex;
  padding: 5px 15px;
}

.vue-simple-context-menu__item:hover {
  background-color: #007aff;
  color: #fff;
}

.vue-simple-context-menu__item-destructive {
  align-items: center;
  color: #f04747;
  cursor: pointer;
  display: flex;
  padding: 5px 15px;
}

.vue-simple-context-menu__item-destructive:hover {
  background-color: #f04747;
  color: #fff;
}

li:first-of-type {
  margin-top: 4px;
}

li:last-of-type {
  margin-bottom: 4px;
}

.v-enter-active,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.v-leave-from,
.v-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.v-enter-active,
.v-leave-active {
  transition: all 250ms;
}
</style>
