import React from 'react'

export function RoomID(roomID: string, t: (key: string) => string): React.ReactElement {
  const style: any = {
    "font-size": "1em"
  }

  return <div className="room-id" style={style}>{ t('label-room') } { roomID }</div>
}
