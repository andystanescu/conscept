"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, useEditorState, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import Paragraph from "@tiptap/extension-paragraph";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { AccentMark } from "./AccentMark";
import { LiveComponentBlock } from "@/components/LiveComponentBlock/LiveComponentBlock";
import styles from "./RichTextEditor.module.css";

const lowlight = createLowlight(common);

// A code block can be flagged "interactive" — on the public page it renders
// as a live, running React component (via react-live) instead of
// syntax-highlighted text. The flag round-trips as data-interactive="true"
// on the <pre> (see RichContent's splitInteractiveBlocks, which looks for
// exactly that attribute).
const InteractiveCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      interactive: {
        default: false,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-interactive") === "true",
        renderHTML: (attributes: { interactive?: boolean }) =>
          attributes.interactive ? { "data-interactive": "true" } : {},
      },
    };
  },
});

const AttributedBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      attribution: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-attribution") || "",
        renderHTML: (attributes: { attribution?: string }) =>
          attributes.attribution ? { "data-attribution": attributes.attribution } : {},
      },
    };
  },
});

const StyledParagraph = Paragraph.extend({
  addAttributes() {
    return {
      className: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("class") || "",
        renderHTML: (attributes: { className?: string }) =>
          attributes.className ? { class: attributes.className } : {},
      },
    };
  },
});

type RichTextEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onContentChange?: () => void;
};

type BlockType = "paragraph" | "eyebrow" | "h1" | "h2" | "h3" | "quote" | "code" | "live";

function readToolbarState(editor: Editor | null) {
  const selectedNode = editor?.state.selection.$from.parent;
  let hasLiveCode = false;
  editor?.state.doc.descendants((node) => {
    if (node.type.name === "codeBlock" && node.attrs.interactive) hasLiveCode = true;
  });
  return {
    bold: editor?.isActive("bold") ?? false,
    italic: editor?.isActive("italic") ?? false,
    bulletList: editor?.isActive("bulletList") ?? false,
    attribution: (editor?.getAttributes("blockquote").attribution as string) ?? "",
    liveCode: selectedNode?.type.name === "codeBlock" ? selectedNode.textContent : "",
    hasLiveCode,
    orderedList: editor?.isActive("orderedList") ?? false,
    codeBlock: editor?.isActive("codeBlock") ?? false,
    interactive: editor?.isActive("codeBlock", { interactive: true }) ?? false,
    blockType: (editor?.isActive("codeBlock", { interactive: true })
      ? "live"
      : editor?.isActive("paragraph", { className: "label-eyebrow" })
      ? "eyebrow"
      : editor?.isActive("heading", { level: 1 })
      ? "h1"
      : editor?.isActive("heading", { level: 2 })
        ? "h2"
        : editor?.isActive("heading", { level: 3 })
          ? "h3"
          : editor?.isActive("blockquote")
            ? "quote"
            : editor?.isActive("codeBlock")
              ? "code"
              : "paragraph") as BlockType,
  };
}

// Body-copy editor for case studies and articles. Outputs HTML into a
// hidden input so the surrounding native <form method="POST"> still works
// unchanged — this component only needs to keep that input in sync.
export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Write the full story…",
  onContentChange,
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typeStyleRef = useRef<HTMLDivElement>(null);
  const [typeStyleOpen, setTypeStyleOpen] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        codeBlock: false,
        blockquote: false,
        paragraph: false,
      }),
      StyledParagraph,
      AttributedBlockquote,
      InteractiveCodeBlock.configure({ lowlight }),
      Image,
      Placeholder.configure({ placeholder }),
      AccentMark,
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: styles.content },
    },
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = editor.getHTML();
      }
      onContentChange?.();
    },
  });

  // useEditor's host component doesn't re-render on every transaction by
  // default (a deliberate perf change in modern @tiptap/react) — reading
  // editor.isActive(...) straight in the render body would only ever
  // reflect whatever it was on the last content-changing update, not the
  // current cursor position. useEditorState subscribes properly so the
  // toolbar (active marks, the block-type dropdown) tracks selection too.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => readToolbarState(editor),
  });

  useEffect(() => {
    if (editor && hiddenInputRef.current) {
      hiddenInputRef.current.value = editor.getHTML();
    }
  }, [editor]);

  useEffect(() => {
    if (!typeStyleOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!typeStyleRef.current?.contains(event.target as Node)) {
        setTypeStyleOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [typeStyleOpen]);

  if (!editor) {
    return (
      <textarea
        name={name}
        defaultValue={defaultValue}
        className={styles.content}
      />
    );
  }

  // useEditorState types as nullable (matching the case where editor
  // itself is null) — editor is confirmed non-null above, so this is
  // just narrowing the type, not a real fallback path.
  const state = toolbarState ?? readToolbarState(editor);

  // clearNodes() first so switching types REPLACES the current block
  // instead of wrapping it (e.g. Quote -> Code -> Quote would otherwise
  // nest a second blockquote around the first instead of just being one).
  const setBlockType = (value: BlockType) => {
    const chain = editor.chain().focus().clearNodes();
    switch (value) {
      case "eyebrow":
        chain.setNode("paragraph", { className: "label-eyebrow" }).run();
        break;
      case "h1":
        chain.setHeading({ level: 1 }).run();
        break;
      case "h2":
        chain.setHeading({ level: 2 }).run();
        break;
      case "h3":
        chain.setHeading({ level: 3 }).run();
        break;
      case "quote":
        chain.setBlockquote().run();
        break;
      case "code":
        chain.setCodeBlock().run();
        break;
      case "live":
        chain.setCodeBlock().updateAttributes("codeBlock", { interactive: true }).run();
        break;
      default:
        chain.setParagraph().run();
    }
  };

  const handleImageFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error ?? "Image upload failed.");
      return;
    }
    editor.chain().focus().setImage({ src: data.url }).run();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            state.bold ? styles.toolbarButtonActive : ""
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            state.italic ? styles.toolbarButtonActive : ""
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <em>I</em>
        </button>
        <span className={styles.toolbarDivider} />
        <div className={styles.toolbarSelectWrap} ref={typeStyleRef}>
          <button
            type="button"
            className={styles.toolbarSelect}
            onClick={() => setTypeStyleOpen((open) => !open)}
            aria-label="Text style"
            aria-expanded={typeStyleOpen}
            aria-haspopup="listbox"
            title="Text style"
          >
            {state.blockType === "paragraph"
              ? "P"
              : state.blockType === "quote"
                ? "Q"
              : state.blockType === "code"
                  ? "</>"
                  : state.blockType === "live"
                    ? "⚡"
                  : state.blockType === "eyebrow"
                    ? "E"
                  : state.blockType.toUpperCase()}
          </button>
        {typeStyleOpen && (
            <div className={styles.toolbarMenu} role="listbox" aria-label="Text style options">
              {([
                ["paragraph", "Paragraph"],
                ["eyebrow", "Eyebrow"],
                ["h1", "Heading 1"],
                ["h2", "Heading 2"],
                ["h3", "Heading 3"],
                ["quote", "Quote"],
                ["code", "Code"],
                ["live", "Live code"],
              ] as [BlockType, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={state.blockType === value}
                  className={`${styles.toolbarMenuButton} ${
                    state.blockType === value ? styles.toolbarButtonActive : ""
                  }`}
                  onClick={() => {
                    setBlockType(value);
                    setTypeStyleOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        {state.codeBlock && (
          <button
            type="button"
            className={`${styles.toolbarButton} ${
              state.interactive ? styles.toolbarButtonActive : ""
            }`}
            onClick={() =>
              editor
                .chain()
                .focus()
                .updateAttributes("codeBlock", { interactive: !state.interactive })
                .run()
            }
            aria-label="Render as live React component"
            title="Render as a live, running React component on the page instead of highlighted text"
          >
            ⚡ Live
          </button>
        )}
        {state.blockType === "quote" && (
          <input
            className={styles.attributionInput}
            value={state.attribution}
            onChange={(event) => editor.chain().focus().updateAttributes("blockquote", { attribution: event.target.value }).run()}
            placeholder="Attribution"
            aria-label="Quote attribution"
          />
        )}
        <span className={styles.toolbarDivider} />
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            state.bulletList ? styles.toolbarButtonActive : ""
          }`}
          onClick={() => {
            const chain = editor.chain().focus();
            // Turning a list off is a plain toggle; turning one on from
            // inside a quote/heading/code block clears that wrapper first
            // so the list replaces it instead of wrapping around it.
            if (!state.bulletList) chain.clearNodes();
            chain.toggleBulletList().run();
          }}
          aria-label="Bullet list"
        >
          •—
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${
            state.orderedList ? styles.toolbarButtonActive : ""
          }`}
          onClick={() => {
            const chain = editor.chain().focus();
            if (!state.orderedList) chain.clearNodes();
            chain.toggleOrderedList().run();
          }}
          aria-label="Numbered list"
        >
          1.
        </button>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          aria-label="Separator line"
        >
          —
        </button>
        <span className={styles.toolbarDivider} />
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Insert image"
        >
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className={state.hasLiveCode && !codeExpanded ? styles.collapsedLiveCode : undefined}>
        <EditorContent editor={editor} />
      </div>
      {state.hasLiveCode && (
        <button
          type="button"
          className={styles.codeExpandButton}
          onClick={() => setCodeExpanded((expanded) => !expanded)}
          aria-expanded={codeExpanded}
        >
          {codeExpanded ? "Collapse code" : "Expand code"}
        </button>
      )}
      {state.interactive && state.liveCode.trim() && (
        <div className={styles.editorPreview}>
          <p className={styles.editorPreviewLabel}>⚡ Live preview</p>
          <LiveComponentBlock code={state.liveCode} />
        </div>
      )}
      <input
        ref={(element) => {
          hiddenInputRef.current = element;
          if (element && editor) {
            element.value = editor.getHTML();
          }
        }}
        type="hidden"
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  );
}
