import React, { useState } from 'react'
import { render } from 'react-dom'
import { Slider } from 'react-soft-slider'
import Dat from './dat'
import { defaultState, slides, draggedSpringOptions, trailingSpringOptions } from './data'

import 'react-dat-gui/build/react-dat-gui.css'
import './style.css'

function App() {
  const [state, setState] = useState(defaultState)
  const { enabled, index, nbSlides, trail, draggedScale, sliderWidth, variableHeight, variableWidth, draggedSpring, trailingSpring } = state

  const setIndex = index => setState({ ...state, index })

  const handleClick = i => {
    if (i !== state.index) {
      setIndex(i)
    }
  }

  return (
    <>
      {/* <Dat data={state} onUpdate={setState} /> */}
      <Slider
        enabled={enabled}
        index={index}
        className="wrapper"
        style={{ width: `${sliderWidth}vw` }}
        slideStyle={variableWidth ? undefined : { minWidth: '100%' }}
        onIndexChange={setIndex}
        trail={trail}
        draggedScale={draggedScale}
        draggedSpring={draggedSpringOptions[draggedSpring]}
        trailingSpring={trailingSpringOptions[trailingSpring]}
      >
        {slides.slice(0, nbSlides).map((url, i) => (
          <div
            className="slide"
            key="i"
            onClick={() => handleClick(i)}
            style={{
              width: variableWidth ? `${400 + (i % 3) * 50}px` : '100%',
              margin: variableWidth ? `0 ${10 + (i % 5) * 5}px` : '0 10px',
              height: variableHeight ? `${50 + (i % 2) * 10}%` : '80%',
              backgroundImage: `url(${url})`
            }}
          />
        ))}
      </Slider>
    </>
  )
}

render(<App />, document.getElementById('root'))
