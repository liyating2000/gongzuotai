import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  GripVertical,
  Hash,
  Layers,
  Mail,
  Plus,
  Save,
  Settings,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react';

import { cn } from '../../lib/cn';

type FieldKind =
  | 'single-line'
  | 'multi-line'
  | 'number'
  | 'email'
  | 'select'
  | 'remark'
  | 'phone';

type AvailableField = {
  id: string;
  name: string;
  kind: FieldKind;
  placeholder: string;
};

type LabelDirection = 'horizontal' | 'vertical';
type Alignment = 'left' | 'center' | 'right';
type WidthUnit = 'px' | '%';
type WidthMode = 'fixed' | 'auto';
type VerticalAlign = 'top' | 'center' | 'bottom';

type CanvasField = {
  uid: string;
  fieldId: string;
  name: string;
  kind: FieldKind;
  placeholder: string;
  forceNewRow: boolean;
  columnSpan: number;
  labelDirection: LabelDirection | 'inherit';
  labelWidth: number;
  labelWidthUnit: WidthUnit;
  labelAlign: Alignment | 'inherit';
  titleFontSize: number;
  titleColor: string;
  titleBold: boolean;
  titleLineHeight: number;
  titleWidthMode: WidthMode;
  contentWidthMode: WidthMode;
  contentWidth: number;
  contentHeight: number;
};

type GlobalLayout = {
  columns: number;
  defaultLabelDirection: LabelDirection;
  defaultLabelWidth: number;
  defaultLabelWidthUnit: WidthUnit;
  defaultLabelAlign: Alignment;
  canvasPadding: number;
  rowGap: number;
  columnGap: number;
  verticalAlign: VerticalAlign;
};

type LayoutSnapshot = {
  global: GlobalLayout;
  fields: CanvasField[];
};

type LayoutDesignerProps = {
  title: string;
  onBack: () => void;
  embedded?: boolean;
  availableFields?: readonly AvailableField[];
};

export type { AvailableField, FieldKind };

const defaultAvailableFields: readonly AvailableField[] = [
  { id: 'customer-name', name: '客户姓名', kind: 'single-line', placeholder: '请输入客户姓名' },
  { id: 'phone', name: '手机号', kind: 'phone', placeholder: '请输入手机号' },
  { id: 'email', name: '邮箱', kind: 'email', placeholder: '请输入邮箱' },
  { id: 'age', name: '年龄', kind: 'number', placeholder: '请输入年龄' },
  { id: 'customer-type', name: '客户类型', kind: 'select', placeholder: '请选择客户类型' },
  { id: 'remark', name: '备注', kind: 'remark', placeholder: '请输入备注' },
  { id: 'description', name: '问题描述', kind: 'multi-line', placeholder: '请输入问题描述' },
];

const fieldKindIconMap: Record<FieldKind, typeof Type> = {
  'single-line': Type,
  'multi-line': Layers,
  number: Hash,
  email: Mail,
  select: Layers,
  remark: Layers,
  phone: Hash,
};

const fieldKindLabelMap: Record<FieldKind, string> = {
  'single-line': '单行文本',
  'multi-line': '多行文本',
  number: '数字',
  email: '邮箱',
  select: '下拉单选',
  remark: '备注',
  phone: '手机号',
};

const defaultGlobal: GlobalLayout = {
  columns: 2,
  defaultLabelDirection: 'horizontal',
  defaultLabelWidth: 96,
  defaultLabelWidthUnit: 'px',
  defaultLabelAlign: 'right',
  canvasPadding: 16,
  rowGap: 14,
  columnGap: 16,
  verticalAlign: 'top',
};

const createCanvasField = (source: AvailableField): CanvasField => ({
  uid: `${source.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  fieldId: source.id,
  name: source.name,
  kind: source.kind,
  placeholder: source.placeholder,
  forceNewRow: false,
  columnSpan: 1,
  labelDirection: 'inherit',
  labelWidth: 96,
  labelWidthUnit: 'px',
  labelAlign: 'inherit',
  titleFontSize: 14,
  titleColor: '#1f2937',
  titleBold: false,
  titleLineHeight: 1.5,
  titleWidthMode: 'fixed',
  contentWidthMode: 'auto',
  contentWidth: 240,
  contentHeight: 32,
});

export function LayoutDesigner({
  title,
  onBack,
  embedded = false,
  availableFields = defaultAvailableFields,
}: LayoutDesignerProps) {
  const [global, setGlobal] = useState<GlobalLayout>(defaultGlobal);
  const [fields, setFields] = useState<CanvasField[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [history, setHistory] = useState<LayoutSnapshot[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const dragSourceRef = useRef<{ type: 'palette' | 'canvas'; id: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const selectedField = useMemo(
    () => fields.find((field) => field.uid === selectedUid) ?? null,
    [fields, selectedUid]
  );

  const pushHistory = () => {
    setHistory((current) => {
      const next = [...current, { global, fields: fields.map((field) => ({ ...field })) }];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
  };

  const handleAddField = (source: AvailableField, insertIndex?: number) => {
    pushHistory();
    const newField = createCanvasField(source);
    setFields((current) => {
      const next = [...current];
      const target = typeof insertIndex === 'number' ? insertIndex : next.length;
      next.splice(target, 0, newField);
      return next;
    });
    setSelectedUid(newField.uid);
  };

  const handleMoveField = (fromUid: string, toIndex: number) => {
    setFields((current) => {
      const fromIndex = current.findIndex((field) => field.uid === fromUid);
      if (fromIndex === -1) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      const target = toIndex > fromIndex ? toIndex - 1 : toIndex;
      next.splice(Math.max(0, Math.min(next.length, target)), 0, moved);
      return next;
    });
  };

  const handleRemoveField = (uid: string) => {
    pushHistory();
    setFields((current) => current.filter((field) => field.uid !== uid));
    setSelectedUid((current) => (current === uid ? null : current));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, current.length - 1));
    setGlobal(previous.global);
    setFields(previous.fields);
    setSelectedUid((current) =>
      current && previous.fields.some((field) => field.uid === current) ? current : null
    );
  };

  const handleSave = () => {
    const payload: LayoutSnapshot = { global, fields };
    // eslint-disable-next-line no-console
    console.log('[字段布局] 保存配置 JSON:', JSON.stringify(payload, null, 2));
    setToast('已模拟保存');
  };

  const updateField = (uid: string, patch: Partial<CanvasField>) => {
    pushHistory();
    setFields((current) =>
      current.map((field) => (field.uid === uid ? { ...field, ...patch } : field))
    );
  };

  const updateGlobal = (patch: Partial<GlobalLayout>) => {
    pushHistory();
    setGlobal((current) => {
      const next = { ...current, ...patch };
      if (patch.columns !== undefined) {
        setFields((rows) =>
          rows.map((field) =>
            field.columnSpan > next.columns
              ? { ...field, columnSpan: next.columns }
              : field
          )
        );
      }
      return next;
    });
  };

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', embedded ? '' : 'px-3 pb-3 pt-2')}>
      {embedded ? null : (
        <div className="pb-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-[3px] text-[18px] font-semibold text-slate-800 transition-colors hover:text-slate-600"
          >
            <ChevronLeft size={17} />
            <span>{title}</span>
          </button>
        </div>
      )}

      <div
        className="grid min-h-0 flex-1 gap-[10px]"
        style={{ gridTemplateColumns: 'minmax(220px, 240px) minmax(0, 1fr) minmax(280px, 320px)' }}
      >
        <FieldPalette
          fields={availableFields}
          onDragStart={(fieldId) => {
            dragSourceRef.current = { type: 'palette', id: fieldId };
          }}
          onAdd={(source) => handleAddField(source)}
        />

        <CanvasArea
          global={global}
          fields={fields}
          selectedUid={selectedUid}
          onSelect={setSelectedUid}
          onUpdateGlobalColumns={(columns) => updateGlobal({ columns })}
          onUndo={handleUndo}
          undoDisabled={history.length === 0}
          onSave={handleSave}
          onRemove={handleRemoveField}
          onCanvasDrop={(insertIndex) => {
            const source = dragSourceRef.current;
            if (!source) return;
            if (source.type === 'palette') {
              const palette = availableFields.find((field) => field.id === source.id);
              if (palette) handleAddField(palette, insertIndex);
            } else {
              handleMoveField(source.id, insertIndex);
            }
            dragSourceRef.current = null;
          }}
          onCanvasItemDragStart={(uid) => {
            dragSourceRef.current = { type: 'canvas', id: uid };
          }}
        />

        <PropertiesPanel
          global={global}
          selectedField={selectedField}
          onUpdateGlobal={updateGlobal}
          onUpdateField={(patch) => {
            if (selectedField) updateField(selectedField.uid, patch);
          }}
        />
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center">
          <div className="pointer-events-auto rounded-[6px] bg-slate-900/85 px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldPalette({
  fields,
  onDragStart,
  onAdd,
}: {
  fields: readonly AvailableField[];
  onDragStart: (fieldId: string) => void;
  onAdd: (source: AvailableField) => void;
}) {
  return (
    <section className="flex min-h-[610px] flex-col overflow-hidden rounded-[6px] border border-[#e7edf3] bg-white">
      <div className="px-[14px] py-[12px] text-[14px] font-semibold text-slate-700">可用字段</div>
      <div className="min-h-0 flex-1 overflow-auto px-[12px] pb-[14px] custom-scrollbar">
        {fields.length === 0 ? (
          <p className="px-[2px] py-[8px] text-[12px] text-slate-400">暂无可用字段，请先在上一步选择字段。</p>
        ) : null}
        <div className="space-y-[8px]">
          {fields.map((field) => {
            const Icon = fieldKindIconMap[field.kind];
            return (
              <div
                key={field.id}
                draggable
                onDragStart={() => onDragStart(field.id)}
                className="group flex cursor-grab items-center justify-between rounded-[6px] border border-[#eef2f6] bg-white px-[10px] py-[8px] text-[13px] text-slate-700 transition-colors hover:border-[#87e0d4] hover:bg-[#f4fcfa] active:cursor-grabbing"
              >
                <div className="flex items-center gap-[8px]">
                  <GripVertical size={14} className="text-slate-300 group-hover:text-[#21c4b0]" />
                  <Icon size={14} className="text-[#21c4b0]" />
                  <div className="flex flex-col">
                    <span className="font-medium">{field.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {fieldKindLabelMap[field.kind]}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(field)}
                  className="rounded-full p-[2px] text-slate-300 transition-colors hover:bg-[#ecfbf8] hover:text-[#18bca2]"
                  aria-label={`添加${field.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-[14px] text-[11px] leading-[1.6] text-slate-400">
          拖拽字段到中间画布，或点击右侧 + 直接添加。
        </p>
      </div>
    </section>
  );
}

function CanvasArea({
  global,
  fields,
  selectedUid,
  onSelect,
  onUpdateGlobalColumns,
  onUndo,
  undoDisabled,
  onSave,
  onRemove,
  onCanvasDrop,
  onCanvasItemDragStart,
}: {
  global: GlobalLayout;
  fields: CanvasField[];
  selectedUid: string | null;
  onSelect: (uid: string | null) => void;
  onUpdateGlobalColumns: (columns: number) => void;
  onUndo: () => void;
  undoDisabled: boolean;
  onSave: () => void;
  onRemove: (uid: string) => void;
  onCanvasDrop: (insertIndex: number) => void;
  onCanvasItemDragStart: (uid: string) => void;
}) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const verticalAlignClass: Record<VerticalAlign, string> = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  };

  return (
    <section className="flex min-h-[610px] min-w-0 flex-col overflow-hidden rounded-[6px] border border-[#e7edf3] bg-white">
      <div className="flex items-center justify-between border-b border-[#eef2f6] px-[14px] py-[10px]">
        <div className="flex items-center gap-[14px]">
          <label className="flex items-center gap-[6px] text-[13px] text-slate-600">
            列数
            <select
              value={global.columns}
              onChange={(event) => onUpdateGlobalColumns(Number(event.target.value))}
              className="h-[28px] rounded-[4px] border border-[#e5e9ef] bg-white px-2 text-[13px] text-slate-700 outline-none focus:border-[#87e0d4]"
            >
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  {value} 列
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            disabled={undoDisabled}
            onClick={onUndo}
            className={cn(
              'inline-flex h-[28px] items-center gap-[4px] rounded-[4px] border px-3 text-[13px] transition-colors',
              undoDisabled
                ? 'cursor-not-allowed border-[#eef2f6] text-slate-300'
                : 'border-[#e5e9ef] text-slate-600 hover:border-[#87e0d4] hover:text-[#18bca2]'
            )}
          >
            <Undo2 size={14} />
            撤销
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex h-[28px] items-center gap-[4px] rounded-[4px] border border-[#87e0d4] bg-[#ecfbf8] px-3 text-[13px] font-medium text-[#18bca2] transition-colors hover:bg-[#dff7f1]"
          >
            <Save size={14} />
            保存
          </button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto custom-scrollbar"
        onClick={() => onSelect(null)}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (fields.length === 0) {
            onCanvasDrop(0);
          } else if (dragOverIndex !== null) {
            onCanvasDrop(dragOverIndex);
          } else {
            onCanvasDrop(fields.length);
          }
          setDragOverIndex(null);
        }}
      >
        <div
          className={cn('grid', verticalAlignClass[global.verticalAlign])}
          style={{
            gridTemplateColumns: `repeat(${global.columns}, minmax(0, 1fr))`,
            gap: `${global.rowGap}px ${global.columnGap}px`,
            padding: `${global.canvasPadding}px`,
            minHeight: '100%',
          }}
        >
          {fields.length === 0 ? (
            <div
              className="col-span-full flex h-[200px] items-center justify-center rounded-[6px] border-2 border-dashed border-[#e5e9ef] text-[13px] text-slate-400"
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(0);
              }}
            >
              拖拽左侧字段到此处开始布局
            </div>
          ) : (
            fields.map((field, index) => (
              <CanvasFieldItem
                key={field.uid}
                field={field}
                global={global}
                selected={field.uid === selectedUid}
                isDropTarget={dragOverIndex === index}
                onSelect={(event) => {
                  event.stopPropagation();
                  onSelect(field.uid);
                }}
                onRemove={(event) => {
                  event.stopPropagation();
                  onRemove(field.uid);
                }}
                onDragStart={() => onCanvasItemDragStart(field.uid)}
                onDragOver={(event) => {
                  event.preventDefault();
                  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                  const isAfter = event.clientY - rect.top > rect.height / 2;
                  setDragOverIndex(isAfter ? index + 1 : index);
                }}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function CanvasFieldItem({
  field,
  global,
  selected,
  isDropTarget,
  onSelect,
  onRemove,
  onDragStart,
  onDragOver,
}: {
  field: CanvasField;
  global: GlobalLayout;
  selected: boolean;
  isDropTarget: boolean;
  onSelect: (event: React.MouseEvent) => void;
  onRemove: (event: React.MouseEvent) => void;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent) => void;
}) {
  const direction =
    field.labelDirection === 'inherit' ? global.defaultLabelDirection : field.labelDirection;
  const labelAlign = field.labelAlign === 'inherit' ? global.defaultLabelAlign : field.labelAlign;
  const labelAlignClass: Record<Alignment, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  const labelWidth =
    field.titleWidthMode === 'fixed'
      ? field.labelWidthUnit === '%'
        ? `${field.labelWidth}%`
        : `${field.labelWidth}px`
      : 'auto';

  const span = Math.min(field.columnSpan, global.columns);
  const newRowStyle = field.forceNewRow ? { gridColumnStart: 1 } : {};

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onClick={onSelect}
      className={cn(
        'group relative cursor-pointer rounded-[6px] border bg-white px-[10px] py-[8px] transition-shadow',
        selected
          ? 'border-[#21c4b0] shadow-[0_0_0_3px_rgba(33,196,176,0.18)]'
          : 'border-[#eef2f6] hover:border-[#87e0d4]',
        isDropTarget && 'ring-2 ring-[#87e0d4]'
      )}
      style={{
        gridColumn: `span ${span} / span ${span}`,
        ...newRowStyle,
      }}
    >
      <div
        className={cn(
          'flex w-full',
          direction === 'horizontal' ? 'flex-row items-center gap-[10px]' : 'flex-col gap-[6px]'
        )}
      >
        <div
          className={cn('shrink-0', direction === 'horizontal' ? labelAlignClass[labelAlign] : '')}
          style={{
            width: direction === 'horizontal' ? labelWidth : '100%',
            fontSize: `${field.titleFontSize}px`,
            color: field.titleColor,
            fontWeight: field.titleBold ? 600 : 400,
            lineHeight: field.titleLineHeight,
          }}
        >
          {field.name}
        </div>
        <div
          className="flex-1"
          style={{
            width: field.contentWidthMode === 'fixed' ? `${field.contentWidth}px` : '100%',
            maxWidth: field.contentWidthMode === 'fixed' ? `${field.contentWidth}px` : undefined,
          }}
        >
          {field.kind === 'multi-line' || field.kind === 'remark' ? (
            <textarea
              readOnly
              placeholder={field.placeholder}
              className="w-full resize-none rounded-[4px] border border-[#e5e9ef] bg-[#fafcfe] px-[8px] py-[6px] text-[13px] text-slate-500 outline-none"
              style={{ height: `${Math.max(field.contentHeight, 56)}px` }}
            />
          ) : field.kind === 'select' ? (
            <select
              disabled
              className="w-full rounded-[4px] border border-[#e5e9ef] bg-[#fafcfe] px-[8px] text-[13px] text-slate-500 outline-none"
              style={{ height: `${field.contentHeight}px` }}
            >
              <option>{field.placeholder}</option>
            </select>
          ) : (
            <input
              readOnly
              placeholder={field.placeholder}
              className="w-full rounded-[4px] border border-[#e5e9ef] bg-[#fafcfe] px-[8px] text-[13px] text-slate-500 outline-none"
              style={{ height: `${field.contentHeight}px` }}
            />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`删除${field.name}`}
        className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full border border-[#e5e9ef] bg-white text-slate-400 transition-colors hover:border-[#f0a4a4] hover:text-[#e26060] group-hover:flex"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function PropertiesPanel({
  global,
  selectedField,
  onUpdateGlobal,
  onUpdateField,
}: {
  global: GlobalLayout;
  selectedField: CanvasField | null;
  onUpdateGlobal: (patch: Partial<GlobalLayout>) => void;
  onUpdateField: (patch: Partial<CanvasField>) => void;
}) {
  return (
    <section className="flex min-h-[610px] flex-col overflow-hidden rounded-[6px] border border-[#e7edf3] bg-white">
      <div className="flex items-center gap-[6px] border-b border-[#eef2f6] px-[14px] py-[12px] text-[14px] font-semibold text-slate-700">
        <Settings size={14} className="text-[#21c4b0]" />
        {selectedField ? `字段：${selectedField.name}` : '全局样式 / 布局'}
      </div>
      <div className="min-h-0 flex-1 space-y-[18px] overflow-auto px-[14px] py-[14px] custom-scrollbar">
        {selectedField ? (
          <FieldProperties field={selectedField} global={global} onUpdate={onUpdateField} />
        ) : (
          <GlobalProperties global={global} onUpdate={onUpdateGlobal} />
        )}
      </div>
    </section>
  );
}

function GlobalProperties({
  global,
  onUpdate,
}: {
  global: GlobalLayout;
  onUpdate: (patch: Partial<GlobalLayout>) => void;
}) {
  return (
    <>
      <SectionTitle>布局结构</SectionTitle>
      <Row label="列数">
        <select
          value={global.columns}
          onChange={(event) => onUpdate({ columns: Number(event.target.value) })}
          className={inputClass}
        >
          {[1, 2, 3, 4].map((value) => (
            <option key={value} value={value}>
              {value} 列
            </option>
          ))}
        </select>
      </Row>
      <Row label="画布内边距">
        <NumberInput
          value={global.canvasPadding}
          onChange={(value) => onUpdate({ canvasPadding: value })}
          suffix="px"
        />
      </Row>
      <Row label="垂直间距">
        <NumberInput
          value={global.rowGap}
          onChange={(value) => onUpdate({ rowGap: value })}
          suffix="px"
        />
      </Row>
      <Row label="水平间距">
        <NumberInput
          value={global.columnGap}
          onChange={(value) => onUpdate({ columnGap: value })}
          suffix="px"
        />
      </Row>
      <Row label="纵向对齐">
        <SegmentedControl
          value={global.verticalAlign}
          options={[
            { value: 'top', label: '顶部' },
            { value: 'center', label: '居中' },
            { value: 'bottom', label: '底部' },
          ]}
          onChange={(value) => onUpdate({ verticalAlign: value as VerticalAlign })}
        />
      </Row>

      <SectionTitle>标签默认</SectionTitle>
      <Row label="排列方向">
        <SegmentedControl
          value={global.defaultLabelDirection}
          options={[
            { value: 'horizontal', label: '左右' },
            { value: 'vertical', label: '上下' },
          ]}
          onChange={(value) =>
            onUpdate({ defaultLabelDirection: value as LabelDirection })
          }
        />
      </Row>
      <Row label="标签宽度">
        <div className="flex items-center gap-[6px]">
          <NumberInput
            value={global.defaultLabelWidth}
            onChange={(value) => onUpdate({ defaultLabelWidth: value })}
          />
          <select
            value={global.defaultLabelWidthUnit}
            onChange={(event) =>
              onUpdate({ defaultLabelWidthUnit: event.target.value as WidthUnit })
            }
            className={cn(inputClass, 'w-[60px]')}
          >
            <option value="px">px</option>
            <option value="%">%</option>
          </select>
        </div>
      </Row>
      <Row label="标签对齐">
        <SegmentedControl
          value={global.defaultLabelAlign}
          options={[
            { value: 'left', label: '左' },
            { value: 'center', label: '中' },
            { value: 'right', label: '右' },
          ]}
          onChange={(value) => onUpdate({ defaultLabelAlign: value as Alignment })}
        />
      </Row>
    </>
  );
}

function FieldProperties({
  field,
  global,
  onUpdate,
}: {
  field: CanvasField;
  global: GlobalLayout;
  onUpdate: (patch: Partial<CanvasField>) => void;
}) {
  return (
    <>
      <SectionTitle>布局</SectionTitle>
      <Row label="强制单行">
        <Switch
          checked={field.forceNewRow}
          onChange={(checked) => onUpdate({ forceNewRow: checked })}
        />
      </Row>
      <Row label="跨列">
        <select
          value={field.columnSpan}
          onChange={(event) => onUpdate({ columnSpan: Number(event.target.value) })}
          className={inputClass}
          disabled={global.columns < 2}
        >
          {Array.from({ length: global.columns }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              占 {value} 列
            </option>
          ))}
        </select>
      </Row>
      <Row label="排列方向">
        <SegmentedControl
          value={field.labelDirection}
          options={[
            { value: 'inherit', label: '跟随' },
            { value: 'horizontal', label: '左右' },
            { value: 'vertical', label: '上下' },
          ]}
          onChange={(value) =>
            onUpdate({ labelDirection: value as CanvasField['labelDirection'] })
          }
        />
      </Row>

      <SectionTitle>标题样式</SectionTitle>
      <Row label="宽度模式">
        <SegmentedControl
          value={field.titleWidthMode}
          options={[
            { value: 'fixed', label: '固定' },
            { value: 'auto', label: '自适应' },
          ]}
          onChange={(value) => onUpdate({ titleWidthMode: value as WidthMode })}
        />
      </Row>
      {field.titleWidthMode === 'fixed' ? (
        <Row label="标签宽度">
          <div className="flex items-center gap-[6px]">
            <NumberInput
              value={field.labelWidth}
              onChange={(value) => onUpdate({ labelWidth: value })}
            />
            <select
              value={field.labelWidthUnit}
              onChange={(event) => onUpdate({ labelWidthUnit: event.target.value as WidthUnit })}
              className={cn(inputClass, 'w-[60px]')}
            >
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </Row>
      ) : null}
      <Row label="标签对齐">
        <SegmentedControl
          value={field.labelAlign}
          options={[
            { value: 'inherit', label: '跟随' },
            { value: 'left', label: '左' },
            { value: 'center', label: '中' },
            { value: 'right', label: '右' },
          ]}
          onChange={(value) => onUpdate({ labelAlign: value as CanvasField['labelAlign'] })}
        />
      </Row>
      <Row label="字体大小">
        <NumberInput
          value={field.titleFontSize}
          onChange={(value) => onUpdate({ titleFontSize: value })}
          suffix="px"
        />
      </Row>
      <Row label="字体颜色">
        <div className="flex items-center gap-[6px]">
          <input
            type="color"
            value={field.titleColor}
            onChange={(event) => onUpdate({ titleColor: event.target.value })}
            className="h-[28px] w-[36px] cursor-pointer rounded-[4px] border border-[#e5e9ef] bg-white p-[2px]"
          />
          <input
            type="text"
            value={field.titleColor}
            onChange={(event) => onUpdate({ titleColor: event.target.value })}
            className={cn(inputClass, 'flex-1')}
          />
        </div>
      </Row>
      <Row label="加粗">
        <Switch
          checked={field.titleBold}
          onChange={(checked) => onUpdate({ titleBold: checked })}
        />
      </Row>
      <Row label="行高">
        <NumberInput
          value={field.titleLineHeight}
          step={0.1}
          onChange={(value) => onUpdate({ titleLineHeight: value })}
        />
      </Row>

      <SectionTitle>内容样式</SectionTitle>
      <Row label="宽度模式">
        <SegmentedControl
          value={field.contentWidthMode}
          options={[
            { value: 'fixed', label: '固定' },
            { value: 'auto', label: '自适应' },
          ]}
          onChange={(value) => onUpdate({ contentWidthMode: value as WidthMode })}
        />
      </Row>
      {field.contentWidthMode === 'fixed' ? (
        <Row label="输入框宽度">
          <NumberInput
            value={field.contentWidth}
            onChange={(value) => onUpdate({ contentWidth: value })}
            suffix="px"
          />
        </Row>
      ) : null}
      <Row label="输入框高度">
        <NumberInput
          value={field.contentHeight}
          onChange={(value) => onUpdate({ contentHeight: value })}
          suffix="px"
        />
      </Row>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-dashed border-[#eef2f6] pb-[6px] text-[12px] font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-[10px]">
      <span className="shrink-0 text-[13px] text-slate-600">{label}</span>
      <div className="min-w-0 flex-1 max-w-[180px]">{children}</div>
    </div>
  );
}

const inputClass =
  'h-[28px] w-full rounded-[4px] border border-[#e5e9ef] bg-white px-2 text-[13px] text-slate-700 outline-none focus:border-[#87e0d4]';

function NumberInput({
  value,
  onChange,
  suffix,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-[4px]">
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(next);
        }}
        className={inputClass}
      />
      {suffix ? <span className="shrink-0 text-[12px] text-slate-400">{suffix}</span> : null}
    </div>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-colors',
        checked ? 'bg-[#21c4b0]' : 'bg-[#e5e9ef]'
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
        )}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex h-[28px] items-center rounded-[4px] border border-[#e5e9ef] bg-[#f7f9fc] p-[2px]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'h-full px-[10px] text-[12px] transition-colors',
              active ? 'rounded-[3px] bg-white text-[#18bca2] shadow-sm' : 'text-slate-500'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
