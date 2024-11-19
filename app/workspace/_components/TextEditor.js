import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import EditorExtension from "./EditorExtension";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function TextEditor({ fileId }) {

  const notes = useQuery(api.notes.GetNotes, {
    fileId: fileId,
  })

  const editor = useEditor({
    extensions: [
      StarterKit, 
      Placeholder.configure({
        placeholder: "Start taking your notes here...",
      }),
      Underline, // Underline extension
      Highlight.configure({ multicolor: true }), // Highlight extension
      TextAlign.configure({ types: ["heading", "paragraph"] }), // Text alignment
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none h-screen p-5",
      },
    },
  });

  useEffect(() => {
    editor && editor.commands.setContent(notes);
  }, [notes])

  return (
    <div>
      <EditorExtension editor={editor} />
      <div className=" overflow-scroll h-[88vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default TextEditor;
