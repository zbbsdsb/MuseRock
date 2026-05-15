import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Search } from 'lucide-react';
import type { ProjectElement, ElementType } from '../../types/project';
import DraggableElement from './DraggableElement';
import { elementTypeLabels } from './elementIcons';
import SmartTip from '../SmartTip';

function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

interface ElementOrganizationProps {
  elements: ProjectElement[];
  onElementsChange: (elements: ProjectElement[]) => void;
}

export default function ElementOrganization({ elements, onElementsChange }: ElementOrganizationProps) {
  const [items, setItems] = useState<string[]>(elements.map(e => e.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [hasAddedElements, setHasAddedElements] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (elements.length > 2 && !hasAddedElements) {
      setHasAddedElements(true);
    }
  }, [elements.length, hasAddedElements]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        const reorderedElements = reorderedItems.map(id => 
          elements.find(e => e.id === id)!
        );
        onElementsChange(reorderedElements);
        
        return reorderedItems;
      });
    }
  };

  const handleUpdate = (id: string, updates: Partial<ProjectElement>) => {
    const updatedElements = elements.map(e => 
      e.id === id ? { ...e, ...updates, updatedAt: new Date() } : e
    );
    onElementsChange(updatedElements);
  };

  const handleDelete = (id: string) => {
    const updatedElements = elements.filter(e => e.id !== id);
    const updatedItems = items.filter(i => i !== id);
    setItems(updatedItems);
    onElementsChange(updatedElements);
  };

  const handleMoveUp = (id: string) => {
    const index = items.indexOf(id);
    if (index > 0) {
      const newItems = arrayMove(items, index, index - 1);
      setItems(newItems);
      const reorderedElements = newItems.map(i => elements.find(e => e.id === i)!);
      onElementsChange(reorderedElements);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = items.indexOf(id);
    if (index < items.length - 1) {
      const newItems = arrayMove(items, index, index + 1);
      setItems(newItems);
      const reorderedElements = newItems.map(i => elements.find(e => e.id === i)!);
      onElementsChange(reorderedElements);
    }
  };

  const handleDuplicate = (id: string) => {
    const element = elements.find(e => e.id === id);
    if (element) {
      const index = items.indexOf(id);
      const newElement: ProjectElement = {
        ...element,
        id: `${element.id}-${Date.now()}`,
        name: `${element.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newItems = [...items.slice(0, index + 1), newElement.id, ...items.slice(index + 1)];
      setItems(newItems);
      onElementsChange([...elements.slice(0, index + 1), newElement, ...elements.slice(index + 1)]);
    }
  };

  const filteredElements = elements.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addElement = (type: ElementType) => {
    const newElement: ProjectElement = {
      id: `element-${Date.now()}`,
      type,
      name: `New ${elementTypeLabels[type]}`,
      content: '',
      order: elements.length,
      isExpanded: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newItems = [...items, newElement.id];
    setItems(newItems);
    onElementsChange([...elements, newElement]);
  };

  const elementTypes: ElementType[] = [
    'paragraph', 'section', 'chapter', 'scene', 'list', 'quote', 'code', 'table'
  ];

  return (
    <div className="flex flex-col h-full">
      {hasAddedElements && (
        <SmartTip
          id="element-timeline-tip"
          message="Dia可以帮你构思时代背景！在构建故事世界时，它能提供历史背景、文化元素等丰富的设定建议。"
          assistantName="Dia"
          position="bottom-right"
          delay={1500}
        />
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-serif italic text-brand-black">Elements</h3>
          <span className="px-2 py-0.5 rounded-full bg-brand-offwhite text-xs font-black text-brand-black/50">
            {elements.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/40" />
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-brand-border bg-brand-paper text-sm text-brand-black placeholder-brand-black/30 focus:outline-none focus:border-violet-500 w-48"
            />
          </div>
          <div className="relative group">
            <button className="p-2 rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors">
              <Plus size={16} />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-brand-paper border border-brand-border rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {elementTypes.map(type => (
                <button
                  key={type}
                  onClick={() => addElement(type)}
                  className="w-full px-4 py-2 text-left text-sm text-brand-black hover:bg-brand-paper transition-colors"
                >
                  {elementTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              <AnimatePresence>
                {filteredElements.map((element, index) => (
                  <DraggableElement
                    key={element.id}
                    element={element}
                    index={index}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </AnimatePresence>

              {filteredElements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-offwhite flex items-center justify-center mb-4">
                    <Plus size={24} className="text-brand-black/40" />
                  </div>
                  <p className="text-sm font-medium text-brand-black/60 mb-1">
                    {searchQuery ? 'No elements found' : 'No elements yet'}
                  </p>
                  <p className="text-xs text-brand-black/40">
                    {searchQuery ? 'Try a different search term' : 'Click + to add your first element'}
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {activeId && overId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 pointer-events-none z-40"
          >
            <div 
              className="absolute bg-violet-500/5 rounded-xl border-2 border-dashed border-violet-500"
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: 4,
              }}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
