import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useAction, useMutation } from 'convex/react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Code, Heading1, Heading2, Heading3, Highlighter, Italic, List, Sparkles, Strikethrough, TextQuote, Underline } from 'lucide-react'
import { useParams } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';


function EditorExtension({ editor }) {
  const { fileId } = useParams();
  const { user } = useUser();
  const searchAi = useAction(api.myActions.search);
  const saveNotes = useMutation(api.notes.AddNotes);

  const onAiClick = async () => {
    toast("AI is getting your answer");


    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    const result = await searchAi({
      query: selectedText,
      fileId: fileId
    })

    const unformattedAns = JSON.parse(result);

    let AllunformattedAns = '';
    unformattedAns && unformattedAns.forEach(item => {
      AllunformattedAns += item.pageContent;
    });

    const PROMPT =
      "For question: " +
      selectedText +
      " and with the given content as answer, " +
      "please give appropriate answer in HTML format. The answer content is: " +
      AllunformattedAns;

    const AiModelresult = await chatSession.sendMessage(PROMPT);

    if (!AiModelresult || !AiModelresult.response) {
      toast.error("AI Model failed to generate a response.");
      return;
    }

    let FinalAns = await AiModelresult.response.text();
    FinalAns = FinalAns.replace(/```.*?html|```/g, '').trim();

    if (!FinalAns) {
      toast.error("AI returned an empty answer.");
      return;
    }

    saveNotes({
      notes: editor.getHTML(),
      fileId: fileId,
      createdBy: user?.primaryEmailAddress?.emailAddress,
    })

    const AllText = editor.getHTML();
    editor.commands.setContent(
      AllText + `<p><strong>Answer: </strong>${FinalAns}</p>`
    );

    toast.success("Answer added to the editor.");
  };

  return editor && (
    <div className=' p-5'>
      <div className="control-group">
        <div className="button-group flex gap-3">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            <Heading1 />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          >
            <Heading2 />

          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          >
            <Heading3 />

          </button>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor?.isActive('bold') ? 'text-blue-500' : ''}
          >
            <Bold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'text-blue-500' : ''}
          >
            <Italic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'text-blue-500' : ''}
          >
            <Underline />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'text-blue-500' : ''}
          >
            <Code />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'text-blue-500' : ''}
          >
            <List />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'text-blue-500' : ''}
          >
            <TextQuote />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: 'yellow' }).run()}
            className={editor.isActive('highlight') ? 'text-blue-500' : ''}
          >
            <Highlighter />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'text-blue-500' : ''}
          >
            <Strikethrough />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'text-blue-500' : ''}
          >
            <AlignLeft />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'text-blue-500' : ''}
          >
            <AlignCenter />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'text-blue-500' : ''}
          >
            <AlignRight />
          </button>
          <button
            onClick={() => onAiClick()}
            className={'hover:text-blue-500'}
          >
            <Sparkles />
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorExtension