import { fetchCards } from 'fetch-cards';
import i18next from 'i18next';
import * as ReactDOM from 'react-dom/client';
import { Environment, getEnvironment } from 'root/environment';
import { App } from './components/App';

function getRootElem(): HTMLElement {
  const rootElem = document.getElementById('climate-call')
  if (!rootElem) throw new Error("Can't find element with id 'climate-call'")
  return rootElem
}

async function fetchLocalisation(env: Environment) {
  const localisations = await (await fetch(`${env.httpServerURL}/localisation`)).json()
  return localisations[env.language]
}

async function start() {
  const elem = getRootElem()
  const environment = getEnvironment(elem)
  const cards = await fetchCards(environment)
  const localisation = await fetchLocalisation(environment)
  await i18next.init({
    lng: environment.language,
    resources: {
      [environment.language]: localisation
    }
  })
  const root = ReactDOM.createRoot(elem)
  root.render(<App designs={cards} t={i18next.t}/>)
}

start()
