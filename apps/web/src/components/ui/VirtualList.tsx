import type { ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  containerClassName?: string;
}

export function VirtualList<T>({ items, itemHeight, renderItem, containerClassName = '' }: VirtualListProps<T>) {
  return (
    <div
      role="region"
      className={`relative overflow-y-auto ${containerClassName}`}
      style={{
        height: items.length * itemHeight,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{ height: itemHeight }}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}