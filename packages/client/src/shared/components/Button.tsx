import React, { CSSProperties, ReactElement } from 'react'

type OnClick = () => void;
type ButtonColor = "pink" | "yellow" | "hover"
function getColorHex(color: ButtonColor): string {
  switch (color) {
    case "pink":
      return "#f4ccc5"
    case "yellow":
      return "#fdd76b"
    case "hover":
      return "#cef0ea"
  }
}

type Props = {
  label?: string,
  onClick: OnClick,
  color: ButtonColor,
  children?: ReactElement[]
}

type State = {
  hover: boolean
}

export class Button extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hover: false }
  }

  private setHover(hover: boolean) {
    this.setState({ hover })
  }

  private get colorHex(): string {
    return this.state.hover ? getColorHex("hover") : getColorHex(this.props.color)
  }

  private get style(): CSSProperties {
    return {
      backgroundColor: this.colorHex,
      width: '100%',
      display: 'block',
      border: 'none',
      borderRadius: 0,
      padding: '0.52% 1.04%',
      boxSizing: 'border-box',
      fontFamily: "'Poppins', sans-serif",
      fontSize: '1em',
    }
  }

  render() {
    const { onClick, label, children } = this.props
    const hover = () => this.setHover(true)
    const unhover = () => this.setHover(false)
    const style = this.style

    return <button onClick={onClick} style={style} onMouseEnter={hover} onMouseLeave={unhover}>{ label }{ children }</button>
  }
}

export function PinkButton(label: string, onClick: () => void) {
  return <Button label={label} onClick={onClick} color="pink" />
}

export function YellowButton(label: string, onClick: () => void) {
  return <Button label={label} onClick={onClick} color="yellow" />
}
