import { useRef } from 'react';
import { useVirtual } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerClassName?: string;
}

export function VirtualList<T>({ items, itemHeight, renderItem, containerClassName = '' }: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: () => itemHeight,
  });

  return (
    <div
      ref={parentRef}
      role="region"
      className={`relative overflow-y-auto ${containerClassName}`}
      style={{
        height: virtualizer.totalSize,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${virtualizer.offset}px)`,
        }}
      >
        {virtualizer.virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: itemHeight,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}