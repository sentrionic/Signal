import type { FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue';

export interface ContextMenuItem {
  name: string;
  icon: FunctionalComponent<HTMLAttributes & VNodeProps>;
  isDestructive?: boolean;
}

export interface ContextMenuSelection {
  value: string;
  option: ContextMenuItem;
}
