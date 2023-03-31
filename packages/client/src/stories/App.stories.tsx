import _React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import './font.css'
import { App } from '../components/App';
import { cardDesigns } from './sample_cards'

export default {
  title: 'App',
  component: App
} as ComponentMeta<typeof App>;

const Template: ComponentStory<typeof App> = (args) =>
  <App {...args} designs={cardDesigns} t={key => key} />;

export const Start = Template.bind({});
