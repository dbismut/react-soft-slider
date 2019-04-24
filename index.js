import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import clamp from 'lodash.clamp'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import useResizeObserver from 'use-resize-observer'
import 'intersection-observer'

// style for the slides wrapper
const slides = {
  display: 'flex',
  height: '100%',
  width: '100%',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
  position: 'relative'
}

const trans = (x, s) => `translate3d(${x}px,0,0) scale(${s})`

export function Slider({
  children,
  index,
  onIndexChange,
  className,
  style,
  slideStyle,
  enabled,
  trail,
  draggedScale,
  draggedSpring,
  trailingSpring,
  onDragStart,
  onDragEnd
}) {
  const slideStyleFunc = typeof slideStyle === 'function' ? slideStyle : () => slideStyle
  // root holds are slides wrapper node and we use a ResizeObserver
  // to observe its size in order to recompute the slides position
  // when it changes
  const [root, width] = useResizeObserver()

  // indexRef is an internal reference to the current slide index
  const indexRef = useRef(index)

  // restPos holds a reference to the adjusted position of the slider
  // when rested
  const restPos = useRef(0)

  // visibleIndexes is a Set holding the index of slides that are
  // currently partially or fully visible (intersecting) in the
  // viewport
  const visibleIndexes = useRef(null)
  if (!visibleIndexes.current) visibleIndexes.current = new Set()

  // instances holds a ref to an array of controllers
  // to simulate a spring trail. Mechanics is directly
  // copied from here https://github.com/react-spring/react-spring/blob/31200a79843ce85200b2a7692e8f14788e60f9e9/src/useTrail.js#L14
  const instances = useRef()

  // callback called by the intersection observer updating
  // visibleIndexes
  const cb = slides => {
    slides.forEach(({ isIntersecting, target }) =>
      visibleIndexes.current[isIntersecting ? 'add' : 'delete'](~~target.attributes['data-index'].value)
    )
  }

  const observer = useRef(null)
  if (!observer.current) observer.current = new IntersectionObserver(cb)

  // we add the slides to the IntersectionObserver:
  // this is recomputed everytime the user adds or removes a slide
  useEffect(() => {
    Array.from(root.current.children).forEach(t => observer.current.observe(t))
  }, [children.length, root])

  // removing the observer on unmount
  useEffect(() => observer.current.disconnect, [])

  // setting the springs with initial position set to restPos:
  // this is important when adding slides since changing children
  // length recomputes useSprings
  const [springs, set] = useSprings(children.length, (i, ctrl) => {
    if (i === 0) instances.current = []
    instances.current.push(ctrl)

    // zIndex will make sure the dragged slide stays on top of the others
    return { x: restPos.current, sc: 1, zIndex: 0, immediate: key => key === 'zIndex' }
  })

  // everytime the index changes, we should calculate the right position
  // of the slide so that its centered: this is recomputed everytime
  // the index changes
  useEffect(() => {
    // here we take the selected slide
    const { offsetLeft, offsetWidth } = root.current.children[index]
    // and calculate its position so its centered in the slides wrapper
    restPos.current = -offsetLeft + (width - offsetWidth) / 2

    // two options then:
    // 1. the index was changed through gestures: in that case indexRef
    // is equal to index, we just want to set the position where it should

    if (indexRef.current === index) set(() => ({ x: restPos.current, sc: 1, config: trailingSpring }))
    else {
      // 2. the user has changed the index props: in that case indexRef
      // is outdated and different from index. We want to animate depending
      // on the direction of the slide, with the furthest slide moving first
      // trailing the others

      const dir = index < indexRef.current ? -1 : 1
      // if direction is 1 then the first slide to animate should be the lowest
      // indexed visible slide, if -1 the highest
      const firstToMove = Array.from(visibleIndexes.current).sort()[dir > 0 ? 0 : visibleIndexes.current.size - 1]
      set(i => {
        const attachIdx = i < firstToMove ? i + 1 : i - 1
        const attachController = instances.current[attachIdx]
        return {
          x: restPos.current,
          sc: 1,
          config: trailingSpring,
          attach: trail && i !== firstToMove && !!attachController && (() => attachController)
        }
      })
    }
    // finally we update indexRef to match index
    indexRef.current = index
  }, [index, set, root, width, trail, trailingSpring])

  // adding the bind listener
  const bind = useGesture(
    {
      onDrag: ({ first, last, vxvy: [vx], delta: [xDelta], args: [pressedIndex], temp = springs[pressedIndex].x.getValue() }) => {
        if (first) {
          // if this is the first drag event, we're trailing the controllers
          // to the index being dragged and setting zIndex, scale and config
          set(i => {
            const attachIdx = i === pressedIndex ? -1 : i < pressedIndex ? i + 1 : i - 1
            const attachController = instances.current[attachIdx]
            return {
              x: temp + xDelta,
              sc: draggedScale,
              config: key => (key === 'x' && i === pressedIndex ? draggedSpring : trailingSpring),
              zIndex: i === pressedIndex ? 10 : 0,
              attach: trail && !!attachController && (() => attachController)
            }
          })

          // triggering onDragStart prop if it exists
          onDragStart && onDragStart(pressedIndex)
        } else if (last) {
          // when the user releases the drag and the distance or speed are superior to a threshold
          // we update the indexRef
          if (Math.abs(xDelta) > width / 2 || Math.abs(vx) > 0.3) {
            indexRef.current = clamp(indexRef.current + (xDelta > 0 ? -1 : 1), 0, children.length - 1)
          }
          // if the index is not equal to indexRef we know we've moved a slide
          // so we tell the user to update its index in the next tick and our useEffect
          // will do the rest. RAF is used to make sure we're not updating the index
          // too fast: that might happen if the user wants to update a slide onClick
          // TODO - need an example
          if (index !== indexRef.current) requestAnimationFrame(() => onIndexChange(indexRef.current))
          // if the index hasn't changed then we set the position back to where it should be
          else set(() => ({ x: restPos.current, sc: 1, config: trailingSpring }))

          // triggering onDragEnd prop if it exists
          onDragEnd && onDragEnd(pressedIndex)
        }

        // if not we're just dragging and we're just updating x
        else set(i => ({ x: temp + xDelta, config: key => (key === 'x' && i === pressedIndex ? draggedSpring : trailingSpring) }))

        // and returning temp to keep the initial position in cache along drag
        return temp
      }
    },
    { enabled }
  )

  return (
    <div className={className} style={style}>
      <div ref={root} style={slides}>
        {springs.map(({ x, sc, zIndex }, i) => (
          <animated.div
            // passing the index as an argument will let our handler know
            // which slide is being dragged
            {...bind(i)}
            key={i}
            data-index={i}
            style={{
              ...slideStyleFunc(i),
              zIndex,
              transform: interpolate([x, sc], trans),
              display: 'flex',
              alignItems: 'center',
              willChange: 'transform'
            }}
          >
            {children[i]}
          </animated.div>
        ))}
      </div>
    </div>
  )
}

Slider.defaultProps = {
  className: undefined,
  style: undefined,
  enabled: true,
  trail: true,
  draggedScale: 1,
  draggedSpring: { tension: 1200, friction: 40 },
  trailingSpring: { mass: 10, tension: 800, friction: 200 },
  onDragStart: undefined,
  onDragEnd: undefined
}

Slider.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  onIndexChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  slideStyle: PropTypes.object,
  enabled: PropTypes.bool,
  trail: PropTypes.bool,
  draggedScale: PropTypes.number,
  draggedSpring: PropTypes.object,
  trailingSpring: PropTypes.object,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func
}
