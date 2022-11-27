import { createApp } from './app';
import { mountRoot } from './root'

async function start() {
  const root = await mountRoot()
  await createApp(root)
}

start()
