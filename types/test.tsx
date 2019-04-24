import * as React from 'react'
import { Slider } from 'react-soft-slider'

function App() {
  const [index, setIndex] = React.useState(0)

  return (
    <>
      <Slider
        index={index}
        onIndexChange={setIndex}
        className="wrapper"
        style={{ width: 10 }}
        slideStyle={(i: number) => ({ width: `${100 * i}%` })}
        enabled={false}
        trail={true}
        draggedScale={0.8}
        draggedSpring={{ mass: 1, tension: 100, friction: 40 }}
        trailingSpring={{ mass: 1, tension: 100, friction: 40 }}
        onDragStart={(i: number) => void console.log(i)}
        onDragEnd={(i: number) => void console.log(i)}
      >
        <div />
        <div />
        <div />
      </Slider>
      <Slider index={index} onIndexChange={setIndex} slideStyle={{ minWidth: '100%' }}>
        <div />
      </Slider>
    </>
  )
}
