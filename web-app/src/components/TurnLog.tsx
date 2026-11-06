import { useEffect, useRef } from 'react'
import { formatPokemonName } from '../formatName'
import type { BattleStatus } from '../hooks/useBattleStream'
import type { TurnRound } from '../hooks/useTurnBattle'
import type { Pokemon } from '../types/pokemon'

interface TurnLogProps {
  selected: Pokemon[]
  text: string
  rounds: TurnRound[]
  winnerId: number | null
  status: Exclude<BattleStatus, 'idle'>
  error: string | null
  onCancel: () => void
  onClose: () => void
}

export function TurnLog({ selected, text, rounds, winnerId, status, error, onCancel, onClose }: TurnLogProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const latest = rounds[rounds.length - 1]
  const left = latest?.left ?? placeholder(selected[0])
  const right = latest?.right ?? placeholder(selected[1])
  const title = status === 'streaming'
    ? 'Battle in progress'
    : status === 'error'
      ? 'Battle failed'
      : status === 'cancelled'
        ? 'Battle cancelled'
        : 'Battle'

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [text, rounds])

  return (
    <section
      aria-live="polite"
      className="fixed inset-x-3 bottom-36 z-40 max-h-[45vh] overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 text-slate-900 shadow-xl dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:inset-x-auto sm:left-1/2 sm:w-[min(40rem,calc(100%-2rem))] sm:-translate-x-1/2"
    >
      <div className="flex items-center justify-between gap-3 border-b border-amber-200 px-4 py-3 dark:border-slate-600">
        <h2 className="font-medium">{title}</h2>
        <button type="button" onClick={onClose} className="text-sm underline">
          Close
        </button>
      </div>
      <div className="max-h-[28vh] space-y-3 overflow-y-auto px-4 py-3">
        {error && <p>{error}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {left && <HpBar fighter={left} />}
          {right && <HpBar fighter={right} />}
        </div>
        {text && <p className="whitespace-pre-wrap">{text}</p>}
        <ul className="space-y-1 text-sm">
          {rounds.flatMap(round => round.hits.map((hit, index) => {
            const attacker = hit.attackerId === round.left.id ? round.left.name : round.right.name
            return (
              <li key={`${round.round}-${index}`}>
                {formatPokemonName(attacker)} used {formatPokemonName(hit.move)} for {hit.damage} damage.
              </li>
            )
          }))}
        </ul>
        {status === 'done' && (
          <p className="font-medium">
            {winnerId === null ? 'Draw.' : `${formatPokemonName(nameFor(rounds, winnerId))} wins.`}
          </p>
        )}
        <div ref={endRef} />
      </div>
      {status === 'streaming' && (
        <div className="flex justify-end px-4 py-3">
          <button type="button" onClick={onCancel} className="rounded-full bg-slate-900 px-4 py-1 text-sm text-amber-50">
            Cancel
          </button>
        </div>
      )}
    </section>
  )
}

function HpBar({ fighter }: { fighter: { name: string, hp: number, maxHp: number } }) {
  const ratio = fighter.maxHp === 0 ? 0 : Math.max(0, Math.min(1, fighter.hp / fighter.maxHp))
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{formatPokemonName(fighter.name)}</span>
        <span>{fighter.hp}/{fighter.maxHp}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  )
}

function placeholder(pokemon: Pokemon | undefined) {
  if (!pokemon) return undefined
  return { id: pokemon.id, name: pokemon.name, hp: pokemon.stats.HP, maxHp: pokemon.stats.HP }
}

function nameFor(rounds: TurnRound[], id: number): string {
  for (const round of rounds) {
    if (round.left.id === id) return round.left.name
    if (round.right.id === id) return round.right.name
  }
  return 'Winner'
}
