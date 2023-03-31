import { fetchCards } from 'fetch-cards';
import * as ReactDOM from 'react-dom/client';
import { getEnvironment } from 'root/environment';
import { App } from './components/App';

function getRootElem(): HTMLElement {
  const rootElem = document.getElementById('climate-call')
  if (!rootElem) throw new Error("Can't find element with id 'climate-call'")
  return rootElem
}

async function start() {
  const elem = getRootElem()
  const environment = getEnvironment(elem)
  const cards = await fetchCards(environment)
  const root = ReactDOM.createRoot(elem)
  root.render(<App designs={cards} t={key => key}/>)
}

start()
