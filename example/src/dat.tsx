import React from 'react'
import DatGui, {
  DatBoolean,
  DatButton,
  DatNumber,
  DatFolder,
  DatSelect
} from '@tim-soft/react-dat-gui'

import { slides, springOptions } from './data'

const Dat = ({ data, onUpdate }) => {
  const addSlide = () =>
    data.nbSlides < slides.length - 1 &&
    onUpdate(({ nbSlides, ...rest }) => ({ ...rest, nbSlides: nbSlides + 1 }))

  return (
    <DatGui data={data} onUpdate={onUpdate}>
      <DatFolder title="Slide appearance">
        <DatBoolean path="variableWidth" label="Variable width" />
        <DatBoolean path="variableHeight" label="Variable height" />
        <DatSelect
          path="slideAlign"
          label="Slide Alignment"
          options={['center', 'flex-start', 'flex-end']}
        />
      </DatFolder>
      <DatFolder title="Slides">
        <DatBoolean path="enabled" label="Enabled" />
        <DatBoolean path="autoplay" label="Autoplay" />
        <DatBoolean path="vertical" label="Vertical" />
        <DatNumber
          path="index"
          label="Slide index"
          min={0}
          max={data.nbSlides - 1}
          step={1}
        />
        <DatNumber
          path="sliderWidth"
          label="Slider width"
          min={10}
          max={100}
          step={10}
        />
        <DatButton label={`Add slide (${data.nbSlides})`} onClick={addSlide} />
      </DatFolder>
      <DatFolder title="Configuration">
        <DatNumber
          path="draggedScale"
          label="Dragged scale"
          min={0.1}
          step={0.1}
        />
        <DatNumber
          path="trailingDelay"
          label="trailingDelay"
          min={0}
          step={10}
        />
        <DatSelect
          path="draggedSpring"
          label="Dragged spring"
          options={Object.keys(springOptions)}
        />
        <DatSelect
          path="trailingSpring"
          label="Trailing spring"
          options={Object.keys(springOptions)}
        />
        <DatSelect
          path="releaseSpring"
          label="Release spring"
          options={Object.keys(springOptions)}
        />
      </DatFolder>
    </DatGui>
  )
}

export default Dat
