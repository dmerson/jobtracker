"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { useCallback, useEffect, useRef } from "react";

interface Props {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  name,
  defaultValue = "",
  placeholder,
  minHeight = "12rem",
}: Props) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none px-3 py-2",
        style: `min-height: ${minHeight}`,
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        hiddenRef.current.value = editor.getHTML();
      }
    },
  });

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = defaultValue;
    }
  }, [defaultValue]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `rounded px-2 py-0.5 text-sm font-medium border ${
      active
        ? "bg-zinc-900 text-white border-zinc-900"
        : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
    }`;

  return (
    <div className="mt-1 rounded-md border border-zinc-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200 px-2 py-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><em>I</em></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}><u>U</u></button>
        <span className="mx-1 border-l border-zinc-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
        <span className="mx-1 border-l border-zinc-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. List</button>
        <span className="mx-1 border-l border-zinc-200" />
        <button type="button" onClick={setLink} className={btn(editor.isActive("link"))}>Link</button>
        {editor.isActive("link") && (
          <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={btn(false)}>Unlink</button>
        )}
      </div>

      {/* Editor canvas */}
      <EditorContent editor={editor} />

      {/* Hidden input carries HTML into the server action FormData */}
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
