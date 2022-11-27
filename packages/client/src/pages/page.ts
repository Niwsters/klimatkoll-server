import React from 'react'
import { ICard } from '@shared/models'

export interface Page {
  readonly component: React.ReactElement
  readonly cards: ICard[]
}
