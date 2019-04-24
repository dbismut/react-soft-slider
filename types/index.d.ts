// TypeScript Version: 3.0
import * as React from 'react'

interface SliderProps {
  readonly children: React.ReactNode
  readonly index: number
  readonly onIndexChange: (newIndex: number) => void
  readonly className?: string
  readonly style?: {}
  readonly slideStyle?: {} | ((index: number) => {})
  readonly enabled?: boolean
  readonly trail?: boolean
  readonly draggedScale?: number
  readonly draggedSpring?: {}
  readonly trailingSpring?: {}
  readonly onDragStart?: (pressedIndex: number) => void
  readonly onDragEnd?: (pressedIndex: number) => void
}

type SliderInterface = React.ComponentClass<SliderProps>

declare const Slider: SliderInterface

export { Slider, SliderInterface, SliderProps }
