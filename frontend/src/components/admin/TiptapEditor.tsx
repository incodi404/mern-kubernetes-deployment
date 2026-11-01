import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const TipTapEditor = ({
  content,
  onChange,
  placeholder = "Write your content here...",
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[15rem] p-4 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({
    onClick,
    isActive,
    disabled,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-xl transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-indigo-600 text-white dark:bg-indigo-600 shadow-sm shadow-indigo-500/10"
          : "text-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="border border-card-border rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 border-b border-card-border bg-black dark:bg-slate-800/40 backdrop-blur-sm">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-card-border pr-2 mr-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          >
            <Bold size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          >
            <Italic size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          >
            <UnderlineIcon size={16} />
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-card-border pr-2 mr-1">
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 size={16} />
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 size={16} />
          </MenuButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-card-border pr-2 mr-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
          >
            <List size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
          >
            <ListOrdered size={16} />
          </MenuButton>
        </div>

        {/* Block Types */}
        <div className="flex items-center gap-1 border-r border-card-border pr-2 mr-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
          >
            <Quote size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
          >
            <Code size={16} />
          </MenuButton>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r border-card-border pr-2 mr-1">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
          >
            <AlignLeft size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
          >
            <AlignCenter size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
          >
            <AlignRight size={16} />
          </MenuButton>
        </div>

        {/* History */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo size={16} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo size={16} />
          </MenuButton>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose min-h-[15rem] focus:outline-none"
      />
    </div>
  );
};

export default TipTapEditor;
