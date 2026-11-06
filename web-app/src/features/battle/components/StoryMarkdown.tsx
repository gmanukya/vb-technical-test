import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface StoryMarkdownProps {
  text: string
}

const remarkPlugins = [remarkGfm]

export function StoryMarkdown({ text }: StoryMarkdownProps) {
  return (
    <div className="story-markdown">
      <ReactMarkdown remarkPlugins={remarkPlugins}>{text}</ReactMarkdown>
    </div>
  )
}
