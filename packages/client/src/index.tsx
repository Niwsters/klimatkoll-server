import { App } from './app';
import * as ReactDOM from 'react-dom/client';

function getRootElem(): HTMLElement {
  const rootElem = document.getElementById('climate-call')
  if (!rootElem) throw new Error("Can't find element with id 'climate-call'")
  return rootElem
}

async function start() {
  const elem = getRootElem()
  const root = ReactDOM.createRoot(elem)
  root.render(<App rootElem={elem}/>)
}

start()
