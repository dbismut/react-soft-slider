import React, { useRef, useEffect } from 'react'
import { useSprings, animated, SpringConfig } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import useResizeObserver from 'use-resize-observer'

type SliderProps = {
  children: React.ReactNode[]
  index: number
  onIndexChange: (newIndex: number) => void
  className?: string
  style?: {}
  slideStyle?: React.CSSProperties | ((index: number) => React.CSSProperties)
  onDragStart?: (pressedIndex: number) => void
  onDragEnd?: (pressedIndex: number) => void
  onTap?: (pressedIndex: number) => void
} & typeof defaultProps

const defaultProps = {
  enabled: true,
  vertical: false,
  slideAlign: 'center',
  draggedScale: 1,
  draggedSpring: { tension: 1200, friction: 40 } as SpringConfig,
  trailingSpring: { tension: 120, friction: 30 } as SpringConfig,
  releaseSpring: { tension: 120, friction: 30 } as SpringConfig,
  trailingDelay: 50
}

// style for the slides wrapper
const slidesWrapperStyle = (vertical: boolean): React.CSSProperties => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  flexWrap: 'nowrap',
  alignItems: 'stretch',
  position: 'relative',
  WebkitUserSelect: 'none',
  userSelect: 'none',
  WebkitTouchCallout: 'none',
  flexDirection: vertical ? 'column' : 'row',
  touchAction: vertical ? 'pan-x' : 'pan-y'
})

const clamp = (num: number, clamp: number, higher: number) =>
  Math.min(Math.max(num, clamp), higher)

export const Slider = ({
  children,
  index,
  onIndexChange,
  className,
  style,
  slideStyle,
  enabled,
  vertical,
  slideAlign,
  draggedScale,
  draggedSpring,
  releaseSpring,
  trailingSpring,
  trailingDelay,
  onDragStart,
  onDragEnd,
  onTap
}: SliderProps) => {
  const slideStyleFunc =
    typeof slideStyle === 'function' ? slideStyle : () => slideStyle
  // root holds are slides wrapper node and we use a ResizeObserver
  // to observe its size in order to recompute the slides position
  // when it changes
  const root = useRef<HTMLInputElement>(null)
  const { width, height } = useResizeObserver({ ref: root })

  const axis = vertical ? 'y' : 'x'
  const size = vertical ? height : width

  // indexRef is an internal reference to the current slide index
  const indexRef = useRef(index)

  // restPos holds a reference to the adjusted position of the slider
  // when rested
  const restPos = useRef(0)
  const velocity = useRef(0)

  // visibleIndexes is a Set holding the index of slides that are
  // currently partially or fully visible (intersecting) in the
  // viewport
  const visibleIndexes = useRef(new Set<number>())
  const firstVisibleIndex = useRef(0)
  const lastVisibleIndex = useRef(0)

  // instances holds a ref to an array of controllers
  // to simulate a spring trail. Mechanics is directly
  // copied from here https://github.com/react-spring/react-spring/blob/31200a79843ce85200b2a7692e8f14788e60f9e9/src/useTrail.js#L14
  // const instances = useRef()

  // callback called by the intersection observer updating
  // visibleIndexes
  const cb: IntersectionObserverCallback = slides => {
    slides.forEach(({ isIntersecting, target }) =>
      visibleIndexes.current[isIntersecting ? 'add' : 'delete'](
        Number(target.getAttribute('data-index'))
      )
    )
    const visibles = Array.from(visibleIndexes.current).sort()
    firstVisibleIndex.current = visibles[0]
    lastVisibleIndex.current = visibles[visibles.length - 1]
  }

  const observer = useRef<IntersectionObserver | null>(null)

  // we add the slides to the IntersectionObserver:
  // this is recomputed everytime the user adds or removes a slide
  useEffect(() => {
    if (!observer.current) observer.current = new IntersectionObserver(cb)
    Array.from(root.current!.children).forEach(t =>
      observer.current!.observe(t)
    )
    return () => observer.current!.disconnect()
  }, [children.length, root])

  // setting the springs with initial position set to restPos:
  // this is important when adding slides since changing children
  // length recomputes useSprings
  const [springs, set] = useSprings(children.length, _i => {
    // zIndex will make sure the dragged slide stays on top of the others
    return {
      x: vertical ? 0 : restPos.current,
      y: vertical ? restPos.current : 0,
      s: 1,
      zIndex: 0,
      immediate: key => key === 'zIndex'
    }
  })

  // everytime the index changes, we should calculate the right position
  // of the slide so that its centered: this is recomputed everytime
  // the index changes
  useEffect(() => {
    // if width and height haven't been set don't do anything
    // (this happens on first render before useResizeObserver had the time to kick in)
    if (!width || !height) return
    // here we take the selected slide
    // and calculate its position so its centered in the slides wrapper
    if (vertical) {
      const { offsetTop, offsetHeight } = root.current!.children[
        index
      ] as HTMLElement
      restPos.current = Math.round(-offsetTop + (height - offsetHeight) / 2)
    } else {
      const { offsetLeft, offsetWidth } = root.current!.children[
        index
      ] as HTMLElement
      restPos.current = Math.round(-offsetLeft + (width - offsetWidth) / 2)
    }
    // two options then:
    // 1. the index was changed through gestures: in that case indexRef
    // is equal to index, we just want to set the position where it should

    if (indexRef.current === index) {
      set(_i => ({
        [axis]: restPos.current,
        s: 1,
        config: { ...releaseSpring, velocity: velocity.current }
        // config: key =>
        //   key === axis
        //     ? { ...releaseSpring, velocity: velocity.current }
        //     : undefined,
      }))
    } else {
      // 2. the user has changed the index props: in that case indexRef
      // is outdated and different from index. We want to animate depending
      // on the direction of the slide, with the furthest slide moving first
      // trailing the others

      const dir = index < indexRef.current ? -1 : 1
      // if direction is 1 then the first slide to animate should be the lowest
      // indexed visible slide, if -1 the highest
      const firstToMove =
        dir > 0 ? firstVisibleIndex.current : lastVisibleIndex.current
      set(i => {
        return {
          [axis]: restPos.current,
          s: 1,
          // config: key => key === axis && releaseSpring,
          config: releaseSpring,
          delay:
            i * dir < firstToMove * dir
              ? 0
              : Math.abs(firstToMove - i) * trailingDelay
        }
      })
    }
    // finally we update indexRef to match index
    indexRef.current = index
  }, [
    index,
    set,
    root,
    vertical,
    axis,
    height,
    width,
    releaseSpring,
    draggedSpring,
    trailingDelay
  ])

  // adding the bind listener
  const bind = useDrag(
    ({
      first,
      last,
      tap,
      vxvy: [vx, vy],
      delta: [dx, dy],
      swipe: [sx, sy],
      movement: [movX, movY],
      args: [pressedIndex],
      memo = springs[pressedIndex][axis].getValue()
    }) => {
      if (tap) {
        onTap && onTap(pressedIndex)
        return
      }
      const v = vertical ? vy : vx
      const dir = -Math.sign(vertical ? dy : dx)
      const mov = vertical ? movY : movX
      const swipe = vertical ? sy : sx

      if (first) {
        // if this is the first drag event, we're trailing the controllers
        // to the index being dragged and setting zIndex, scale and config
        set(i => {
          return {
            [axis]: memo + mov,
            s: draggedScale,
            config: key =>
              key === axis && i === pressedIndex
                ? draggedSpring
                : trailingSpring,
            zIndex: i === pressedIndex ? 10 : 0
          }
        })

        // triggering onDragStart prop if it exists
        onDragStart && onDragStart(pressedIndex)
      } else if (last) {
        // when the user releases the drag and the distance or speed are superior to a threshold
        // we update the indexRef
        if (Math.abs(mov) > size! / 2 || swipe !== 0) {
          indexRef.current = clamp(
            indexRef.current + (mov > 0 ? -1 : 1),
            0,
            children.length - 1
          )
        }
        // if the index is not equal to indexRef we know we've moved a slide
        // so we tell the user to update its index in the next tick and our useEffect
        // will do the rest. RAF is used to make sure we're not updating the index
        // too fast: that might happen if the user wants to update a slide onClick
        // TODO - need an example
        if (index !== indexRef.current) {
          velocity.current = v
          requestAnimationFrame(() => onIndexChange(indexRef.current))
        }
        // if the index hasn't changed then we set the position back to where it should be
        else
          set(() => ({
            [axis]: restPos.current,
            s: 1,
            // config: key => key === axis && releaseSpring,
            config: releaseSpring
          }))

        // triggering onDragEnd prop if it exists
        onDragEnd && onDragEnd(pressedIndex)
      }

      // if not we're just dragging and we're just updating the position
      else {
        const firstToMove =
          dir > 0 ? firstVisibleIndex.current : lastVisibleIndex.current
        set(i => {
          return {
            [axis]: mov + memo,
            delay:
              i * dir < firstToMove * dir || i === pressedIndex
                ? 0
                : Math.abs(firstToMove - i) * trailingDelay,
            config: key =>
              key === axis && i === pressedIndex
                ? draggedSpring
                : trailingSpring
          }
        })
      }

      // and returning memo to keep the initial position in cache along drag
      return memo
    },
    { enabled, axis, filterTaps: true }
  )

  return (
    <div className={className} style={style}>
      <div ref={root} style={slidesWrapperStyle(vertical)}>
        {springs.map(({ [axis]: pos, s, zIndex }, i) => (
          <animated.div
            // passing the index as an argument will let our handler know
            // which slide is being dragged
            {...bind(i)}
            key={i}
            data-index={i}
            style={{
              alignItems: slideAlign,
              ...slideStyleFunc(i),
              zIndex,
              [axis]: pos,
              scale: s,
              display: 'flex',
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

Slider.defaultProps = defaultProps
