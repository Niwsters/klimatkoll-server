import React from 'react'

export function TextInput(placeholder: string, onChangeInput: (e: string) => void, appWidth: number) {
  function onChange(event: any) {
    onChangeInput(event.target.value)
  }

  const style: any = {
    'display': 'block',
    'border': 'none',
    'border-radius': 0,
    'padding': `${0.0052*appWidth}px ${0.0104*appWidth}px`,
    'width': '100%',
    'box-sizing': 'border-box',
    'font-family': "'Poppins', sans-serif",
    'font-size': "1em",
  }

  return <input type="text" placeholder={placeholder} onChange={onChange} style={style} />
}
