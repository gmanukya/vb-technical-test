export type BattleStatus = 'idle' | 'streaming' | 'done' | 'error' | 'cancelled'

export type ActiveBattleStatus = Exclude<BattleStatus, 'idle'>

export interface TurnFighter {
  id: number
  name: string
  hp: number
  maxHp: number
}

export interface TurnHit {
  attackerId: number
  move: string
  damage: number
  targetHp: number
}

export interface TurnRound {
  round: number
  left: TurnFighter
  right: TurnFighter
  hits: TurnHit[]
  winnerId: number | null
}
