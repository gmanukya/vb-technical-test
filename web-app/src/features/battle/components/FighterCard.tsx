import { TypeSwatches } from '../../../shared/ui/TypeSwatches'
import type { FighterView } from '../lib/fighterModel'
import { HpMeter } from './HpMeter'

interface FighterCardProps {
  fighter: FighterView
}

export function FighterCard({ fighter }: FighterCardProps) {
  const plateStyle = {
    backgroundColor: 'var(--wash)',
    backgroundImage: fighter.wash,
  }

  return (
    <article className={fighter.className}>
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full lg:h-56 lg:w-56" style={plateStyle}>
        <img src={fighter.image} alt="" className="h-24 w-24 object-contain lg:h-48 lg:w-48" />
      </div>
      <p className="mt-4 text-center text-[11px] tracking-[0.18em] text-muted">{fighter.dexLabel}</p>
      <h2 className="mt-1 text-balance text-center font-display text-2xl leading-none lg:text-4xl">{fighter.name}</h2>
      <div className="mt-3 flex justify-center">
        <TypeSwatches types={fighter.types} />
      </div>
      <HpMeter label={fighter.hpLabel} ratio={fighter.hpRatio} visible={fighter.showHp} />
    </article>
  )
}
