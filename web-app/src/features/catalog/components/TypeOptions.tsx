import { formatPokemonName } from '../../../shared/lib/formatName'
import { typeColor } from '../../../shared/lib/typeColors'
import { POKEMON_TYPES } from '../../../shared/lib/pokemonTypes'
import { typeOptionClassName } from '../lib/catalogClassName'

interface TypeOptionsProps {
  selected: readonly string[]
  onToggle: (type: string) => void
}

interface TypeOptionModel {
  name: string
  label: string
  color: string
  selected: boolean
  className: string
}

export function TypeOptions({ selected, onToggle }: TypeOptionsProps) {
  const options = POKEMON_TYPES.map((name) => {
    const isSelected = selected.includes(name)
    const option: TypeOptionModel = {
      name,
      label: formatPokemonName(name),
      color: typeColor(name),
      selected: isSelected,
      className: typeOptionClassName(isSelected),
    }
    
    return <TypeOption key={name} option={option} onToggle={onToggle} />
  })

  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Filter by type">
      {options}
    </div>
  )
}

interface TypeOptionProps {
  option: TypeOptionModel
  onToggle: (type: string) => void
}

function TypeOption({ option, onToggle }: TypeOptionProps) {
  const dotStyle = { backgroundColor: option.color }
  const toggle = () => onToggle(option.name)

  return (
    <button type="button" onClick={toggle} aria-pressed={option.selected} className={option.className}>
      <span className="h-3 w-3 shrink-0 rounded-full" style={dotStyle} />
      <span className="truncate">{option.label}</span>
    </button>
  )
}
