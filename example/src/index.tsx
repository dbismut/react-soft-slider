import React, { useState, useRef, useCallback, useEffect } from 'react'
import { render } from 'react-dom'
import { Slider } from 'react-soft-slider'
import ResizeObserver from 'resize-observer-polyfill'
import Dat from './dat'
import { defaultState, slides, springOptions } from './data'

import './style.css'

// @ts-ignore
window.ResizeObserver = window.ResizeObserver || ResizeObserver

function App() {
  const [state, setState] = useState(defaultState)
  const timeout = useRef(0)
  const {
    autoplay,
    enabled,
    vertical,
    index,
    nbSlides,
    trailingDelay,
    draggedScale,
    sliderWidth,
    slideAlign,
    variableHeight,
    variableWidth,
    draggedSpring,
    trailingSpring,
    releaseSpring
  } = state

  const setIndex = useCallback(index => setState({ ...state, index }), [state])

  const startAutoplay = useCallback(() => {
    if (autoplay)
      timeout.current = window.setInterval(
        () => setIndex((index + 1) % nbSlides),
        5000
      )
  }, [autoplay, index, nbSlides, setIndex])

  const stopAutoplay = useCallback(() => void clearTimeout(timeout.current), [])

  const handleClick = i => {
    if (i !== state.index) {
      setIndex(i)
    }
  }

  useEffect(() => {
    startAutoplay()
    return stopAutoplay
  }, [startAutoplay, stopAutoplay])

  return (
    <>
      <Dat data={state} onUpdate={setState} />
      <Slider
        enabled={enabled}
        vertical={vertical}
        index={index}
        className="wrapper"
        style={{ width: `${sliderWidth}vw` }}
        slideStyle={
          vertical
            ? variableHeight
              ? undefined
              : { minHeight: '100%' }
            : variableWidth
            ? undefined
            : { minWidth: '100%' }
        }
        slideAlign={slideAlign}
        onIndexChange={setIndex}
        trailingDelay={trailingDelay}
        onDragStart={stopAutoplay}
        onDragEnd={startAutoplay}
        draggedScale={draggedScale}
        draggedSpring={springOptions[draggedSpring]}
        trailingSpring={springOptions[trailingSpring]}
        releaseSpring={springOptions[releaseSpring]}
      >
        {slides.slice(0, nbSlides).map((url, i) => (
          <div
            className="slide"
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: variableWidth ? `${400 + (i % 3) * 100}px` : '100%',
              margin: `${
                variableHeight && vertical
                  ? 10 + (i % 5) * 5
                  : vertical
                  ? 10
                  : 0
              }px ${
                variableWidth && !vertical
                  ? 10 + (i % 5) * 5
                  : vertical
                  ? 0
                  : 10
              }px`,
              height: variableHeight ? `${300 + (i % 2) * 200}px` : '80%',
              backgroundImage: `url(${url})`
            }}
          />
        ))}
      </Slider>
    </>
  )
}

render(<App />, document.getElementById('root'))
