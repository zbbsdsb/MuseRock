import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  useSortable, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  MoreVertical, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Edit3,
  FileText
} from 'lucide-react';
import type { ProjectElement } from '../../types/project';
import { elementTypeIcons, elementTypeLabels, elementTypeColors } from './elementIcons';

interface DraggableElementProps {
  element: ProjectElement;
  index: number;
  onUpdate: (id: string, updates: Partial<ProjectElement>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function DraggableElement({ 
  element, 
  index,
  onUpdate, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  onDuplicate 
}: DraggableElementProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: element.id,
    data: { element },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = elementTypeIcons[element.type] || FileText;
  const colorClass = elementTypeColors[element.type];
  const label = elementTypeLabels[element.type];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleRename = () => {
    const newName = prompt('Enter new name:', element.name);
    if (newName) {
      onUpdate(element.id, { name: newName });
    }
    setContextMenuOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this element?')) {
      onDelete(element.id);
    }
    setContextMenuOpen(false);
  };

  type MenuItem =
    | { type: 'divider' }
    | { icon: any; label: string; action: () => void; disabled?: boolean; danger?: boolean };

  const menuItems: MenuItem[] = [
    { icon: Edit3, label: 'Rename', action: handleRename },
    { icon: Copy, label: 'Duplicate', action: () => { onDuplicate(element.id); setContextMenuOpen(false); } },
    { icon: ArrowUp, label: 'Move Up', action: () => { onMoveUp(element.id); setContextMenuOpen(false); }, disabled: index === 0 },
    { icon: ArrowDown, label: 'Move Down', action: () => { onMoveDown(element.id); setContextMenuOpen(false); } },
    { type: 'divider' },
    { icon: Trash2, label: 'Delete', action: handleDelete, danger: true },
  ];

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
          isDragging 
            ? 'z-50 border-violet-500 bg-violet-500/10 shadow-lg scale-105' 
            : 'border-brand-border hover:border-brand-black/30 hover:bg-brand-paper'
        }`}
        onContextMenu={handleContextMenu}
      >
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 rounded-lg hover:bg-brand-offwhite transition-colors text-brand-black/40 hover:text-brand-black"
        >
          <GripVertical size={14} />
        </div>

        <div className={`w-8 h-8 rounded-lg ${colorClass}/10 flex items-center justify-center shrink-0`}>
          <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-black truncate">
            {element.name || `Untitled ${label}`}
          </p>
          <p className="text-xs text-brand-black/40">{label}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setContextMenuPosition({ x: 0, y: 0 });
              setContextMenuOpen(true);
            }}
            className="p-1.5 rounded-lg text-brand-black/40 hover:text-brand-black hover:bg-brand-paper opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-violet-500/20 rounded-xl border-2 border-violet-500 border-dashed"
          />
        )}
      </motion.div>

      <AnimatePresence>
        {contextMenuOpen && (
          <motion.div
            ref={contextMenuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed z-[100] bg-brand-paper border border-brand-border rounded-xl shadow-xl py-2 min-w-[160px]"
            style={{
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              transform: 'translate(-25%, 0)',
            }}
          >
            {menuItems.map((item, index) => {
            if ('type' in item && item.type === 'divider') {
                return <div key={index} className="h-px bg-brand-border my-2" />;
              }
              if ('action' in item) {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      item.disabled 
                        ? 'text-brand-black/20 cursor-not-allowed'
                        : item.danger
                          ? 'text-red-500 hover:bg-red-500/10'
                          : 'text-brand-black hover:bg-brand-paper'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              }
              return null;
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
