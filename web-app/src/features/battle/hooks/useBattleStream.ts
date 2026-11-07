import { useCallback, useRef, useState } from 'react'

import type { BattleStatus } from '../types'

export function useBattleStream() {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<BattleStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runRef = useRef(0)
  const idsRef = useRef<number[]>([])

  const start = useCallback(async (pokemonIds: number[]) => {
    const runId = ++runRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    idsRef.current = pokemonIds
    setText('')
    setError(null)
    setStatus('streaming')

    try {
      const response = await fetch('/battles', {
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
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done){
          break
        }

        acc += decoder.decode(value, { stream: true })
        
        if (runId === runRef.current) {
          setText(acc)
        }
      }

      acc += decoder.decode()

      if (runId !== runRef.current) {
        return
      }

      setText(acc)
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
    setError(null)
  }, [])

  const retry = useCallback(() => {
    if (idsRef.current.length === 2) {
      void start(idsRef.current)
    }
  }, [start])

  return { text, status, error, start, cancel, close, retry }
}
