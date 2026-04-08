import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'

import { Home } from './pages/Home'
import { Agendar } from './pages/Agendar'

import '@ionic/react/css/core.css'
import './App.css'

setupIonicReact()

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home"    component={Home}    />
          <Route exact path="/agendar" component={Agendar} />
          <Redirect exact from="/"    to="/home"           />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}