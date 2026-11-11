import type { CatalogItem, CategoryNode } from "@/types/product";
import { colorLabel } from "@/utils/color";
import { Icon } from "./Icon";

type Node = CategoryNode & { children?: Node[] };

function Swatch({ name }: { name: string }) {
  const { swatch } = colorLabel(name);
  return (
    <span
      aria-hidden
      className="h-3 w-3 shrink-0 rounded-full border border-zinc-300 dark:border-zinc-600"
      style={
        swatch
          ? { backgroundColor: swatch }
          : {
              background:
                "linear-gradient(45deg, #f4f4f5 25%, transparent 25%, transparent 75%, #f4f4f5 75%), linear-gradient(45deg, #f4f4f5 25%, #e4e4e7 25%, #e4e4e7 75%, #f4f4f5 75%)",
              backgroundSize: "6px 6px",
              backgroundPosition: "0 0, 3px 3px",
            }
      }
    />
  );
}

function TreeNode({
  node,
  selected,
  onToggle,
  depth,
  swatch,
}: {
  node: Node;
  selected: number[];
  onToggle: (id: number) => void;
  depth: number;
  swatch: boolean;
}) {
  const checked = selected.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const label = swatch ? colorLabel(node.name).label : node.name;

  return (
    <div>
      <label
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(node.id)}
          className="h-3.5 w-3.5 shrink-0 accent-blue-600"
        />
        {swatch && <Swatch name={node.name} />}
        <span
          className={`min-w-0 flex-1 truncate ${checked ? "font-medium text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"}`}
        >
          {label || "(nomsiz)"}
        </span>
        {hasChildren && (
          <Icon name="chevron-right" size={12} className="shrink-0 text-zinc-400" />
        )}
      </label>
      {hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selected={selected}
              onToggle={onToggle}
              depth={depth + 1}
              swatch={swatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export interface CheckboxListProps {
  items: CatalogItem[];
  selected: number[];
  onToggle: (id: number) => void;
  placeholder?: string;
  swatch?: boolean;
}

export function CheckboxList({
  items,
  selected,
  onToggle,
  placeholder,
  swatch = false,
}: CheckboxListProps) {
  if (items.length === 0) {
    return (
      <p className="py-1 text-xs text-zinc-400 dark:text-zinc-500">
        {placeholder ?? "Ro'yxat bo'sh"}
      </p>
    );
  }

  return (
    <div className="max-h-44 space-y-0.5 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 dark:border-zinc-700 dark:bg-zinc-800/60">
      {(items as Node[]).map((item) => (
        <TreeNode
          key={item.id}
          node={item}
          selected={selected}
          onToggle={onToggle}
          depth={0}
          swatch={swatch}
        />
      ))}
    </div>
  );
}
