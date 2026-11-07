import { useEffect, useRef } from 'react'
import { StoryMarkdown } from './StoryMarkdown'

interface NarrationProps {
  text: string
}

export function Narration({ text }: NarrationProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [text])

  if (text.length === 0) {
    return null
  }

  return (
    <div className="max-w-[65ch]">
      <StoryMarkdown text={text} />
      <div ref={endRef} />
    </div>
  )
}
