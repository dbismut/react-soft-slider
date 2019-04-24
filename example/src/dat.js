import React from 'react'
import DatGui, { DatBoolean, DatButton, DatNumber, DatFolder, DatSelect } from 'react-dat-gui'

import { slides, draggedSpringOptions, trailingSpringOptions } from './data'

const Dat = ({ data, onUpdate }) => {
  const addSlide = () => data.nbSlides < slides.length - 1 && onUpdate(({ nbSlides, ...rest }) => ({ ...rest, nbSlides: nbSlides + 1 }))

  return (
    <DatGui data={data} onUpdate={onUpdate}>
      <DatFolder title="Slide appearance">
        <DatBoolean path="variableWidth" label="Variable width" />
        <DatBoolean path="variableHeight" label="Variable height" />
      </DatFolder>
      <DatFolder title="Slides" closed={false}>
        <DatBoolean path="enabled" label="Enabled" />
        <DatNumber path="index" label="Slide index" min={0} max={data.nbSlides - 1} step={1} />
        <DatNumber path="sliderWidth" label="Slider width" min={10} max={100} step={10} />
        <DatButton label={`Add slide (${data.nbSlides})`} onClick={addSlide} />
      </DatFolder>
      <DatFolder title="Configuration" closed={false}>
        <DatBoolean path="trail" label="Trail" />
        <DatNumber path="draggedScale" label="Dragged scale" min={0.1} step={0.1} />
        <DatSelect path="draggedSpring" label="Dragged spring" options={Object.keys(draggedSpringOptions)} />
        <DatSelect path="trailingSpring" label="Trailing spring" options={Object.keys(trailingSpringOptions)} />
      </DatFolder>
    </DatGui>
  )
}

export default Dat
