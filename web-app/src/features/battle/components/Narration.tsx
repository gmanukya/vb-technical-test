import { useEffect, useRef } from 'react'
import { StoryMarkdown } from './StoryMarkdown'

interface NarrationProps {
  text: string
  display: boolean
}

export function Narration({ text, display }: NarrationProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [text])

  if (text.length === 0) {
    return null
  }

  return (
    <div className="max-w-[65ch]">
      <NarrationText text={text} display={display} />
      <div ref={endRef} />
    </div>
  )
}

function NarrationText({ text, display }: NarrationProps) {
  if (display) {
    return <StoryMarkdown text={text} />
  }

  return <p className="text-base leading-relaxed whitespace-pre-wrap">{text}</p>
}
