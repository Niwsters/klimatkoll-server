import _React, { CSSProperties } from 'react'

export function TextInput(placeholder: string, onChangeInput: (e: string) => void, appWidth: number) {
  function onChange(event: any) {
    onChangeInput(event.target.value)
  }

  const style: CSSProperties = {
    display: 'block',
    border: 'none',
    borderRadius: 0,
    padding: `${0.0052*appWidth}px ${0.0104*appWidth}px`,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: "1em",
  }

  return <input type="text" placeholder={placeholder} onChange={onChange} style={style} />
}
