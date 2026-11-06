import type { TypeSwatch } from '../lib/typeColors'

interface TypeSwatchesProps {
  types: TypeSwatch[]
}

export function TypeSwatches({ types }: TypeSwatchesProps) {
  const marks = types.map((type) => <TypeSwatchMark key={type.name} type={type} />)

  return <div className="flex items-center gap-1.5">{marks}</div>
}

interface TypeSwatchMarkProps {
  type: TypeSwatch
}

function TypeSwatchMark({ type }: TypeSwatchMarkProps) {
  const style = { backgroundColor: type.color }
  
  return <span className="h-2.5 w-2.5 rounded-full" style={style} title={type.label} aria-label={type.label} />
}
