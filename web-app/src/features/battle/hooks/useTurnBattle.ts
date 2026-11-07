import { useCallback, useRef, useState } from 'react'
import type { BattleStatus, TurnRound } from '../types'

export function useTurnBattle() {
  const [text, setText] = useState('')
  const [rounds, setRounds] = useState<TurnRound[]>([])
  const [winnerId, setWinnerId] = useState<number | null>(null)
  const [status, setStatus] = useState<BattleStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runRef = useRef(0)

  const start = useCallback(async (pokemonIds: number[]) => {
    const runId = ++runRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setText('')
    setRounds([])
    setWinnerId(null)
    setError(null)
    setStatus('streaming')

    let sawWinner = false

    try {
      const response = await fetch('/battles/turns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pokemonIds }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(body?.error ?? 'Could not start the battle')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const split = takeLines(buffer)
        buffer = split.rest
        
        if (runId !== runRef.current) {
          return
        }

        sawWinner = applyLines(split.lines, setText, setRounds, setWinnerId) || sawWinner
      }

      buffer += decoder.decode()
      if (runId !== runRef.current) {
        return
      }

      if (buffer.trim()) {
        sawWinner = applyLines([buffer], setText, setRounds, setWinnerId) || sawWinner
      }
      
      if (!sawWinner) {
        throw new Error('The battle stopped early.')
      }

      setStatus('done')
    } catch (err) {
      if (runId !== runRef.current) {
        return
      }

      if (controller.signal.aborted) {
        setStatus('cancelled')
        return
      }
      
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Could not finish the battle')
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const close = useCallback(() => {
    abortRef.current?.abort()
    runRef.current += 1
    setStatus('idle')
    setText('')
    setRounds([])
    setWinnerId(null)
    setError(null)
  }, [])

  return { text, rounds, winnerId, status, error, start, cancel, close }
}

function takeLines(buffer: string): { lines: string[], rest: string } {
  const lines = buffer.split('\n')
  const rest = lines.pop() ?? ''

  return { lines: lines.filter(line => line.trim().length > 0), rest }
}

function applyLines(
  lines: string[],
  setText: (text: string) => void,
  setRounds: (update: (current: TurnRound[]) => TurnRound[]) => void,
  setWinnerId: (winnerId: number | null) => void,
): boolean {
  let sawWinner = false
  const rounds: TurnRound[] = []
  let nextText: string | null = null

  for (const line of lines) {
    const event = JSON.parse(line) as Partial<TurnRound> & { winnerId?: number | null, text?: string, error?: string }
    
    if (typeof event.text === 'string') {
      nextText = event.text
      continue
    }
    
    if (typeof event.error === 'string' && event.error) {
      throw new Error(event.error)
    }
    
    if (typeof event.round === 'number' && event.left && event.right && event.hits) {
      rounds.push(event as TurnRound)
    }
    
    if ('winnerId' in event && event.round === undefined) {
      setWinnerId(event.winnerId ?? null)
      sawWinner = true
    }
  }

  if (nextText !== null) {
    setText(nextText)
  }

  if (rounds.length > 0) {
    setRounds(current => [...current, ...rounds])
  }
  
  return sawWinner
}
