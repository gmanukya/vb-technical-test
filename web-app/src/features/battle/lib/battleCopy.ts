import { formatPokemonName } from '../../../shared/lib/formatName'
import type { ActiveBattleStatus, BattleStatus, TurnRound } from '../types'

export interface HitLine {
  id: string
  text: string
}

export const BATTLE_TITLE: Record<ActiveBattleStatus, string> = {
  streaming: 'Battle in progress',
  error: 'Battle failed',
  cancelled: 'Battle cancelled',
  done: 'Battle',
}

export const STATUS_NOTE: Record<BattleStatus, string> = {
  idle: '',
  streaming: 'In progress',
  done: '',
  error: '',
  cancelled: 'Cancelled',
}

export function battleBusy(story: BattleStatus, match: BattleStatus): boolean {
  return story === 'streaming' || match === 'streaming'
}

export function hitLines(rounds: readonly TurnRound[]): HitLine[] {
  const lines: HitLine[] = []

  for (const round of rounds) {
    round.hits.forEach((hit, index) => {
      const attacker = attackerName(round, hit.attackerId)

      lines.push({
        id: `${round.round}-${index}`,
        text: `${formatPokemonName(attacker)} used ${formatPokemonName(hit.move)} for ${hit.damage} damage.`,
      })
    })
  }
  return lines
}

export function winnerName(rounds: readonly TurnRound[], winnerId: number | null): string {
  if (winnerId === null) {
    return ''
  }

  for (const round of rounds) {
    if (round.left.id === winnerId) {
      return formatPokemonName(round.left.name)
    }

    if (round.right.id === winnerId) {
      return formatPokemonName(round.right.name)
    }
  }
  return 'Winner'
}

export function winnerText(winnerId: number | null, name: string): string {
  if (winnerId === null) {
    return 'Draw.'
  }

  return `${name} wins.`
}

function attackerName(round: TurnRound, attackerId: number): string {
  if (attackerId === round.left.id) {
    return round.left.name
  }
  
  return round.right.name
}
