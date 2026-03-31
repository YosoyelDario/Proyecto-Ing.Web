import type { ReactNode } from 'react'
import { IonPage, IonHeader, IonContent, IonFooter } from '@ionic/react'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <IonPage>
      <IonHeader className="ion-no-border shadow-none">
        <div className="bg-teal-600 px-6 py-2 text-sm text-white">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
            <div className="flex gap-6">
              <span>📞 22222222</span>
              <span>📧 LoremIpsumHas.com</span>
            </div>
            <div className="font-semibold">Municipalidad De Santo Domingo</div>
          </div>
        </div>
        <nav className="bg-white px-6 py-4 shadow-sm">
          {/* Contenido de navegación estático */}
          <div className="mx-auto flex max-w-[1400px] items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="flex size-20 items-center justify-center rounded-full bg-teal-600 p-2 text-center text-xs font-bold text-white">LOGO</div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase text-gray-900 lg:gap-10">
              <a href="#">Lorem Us</a>
            </div>
          </div>
        </nav>
      </IonHeader>

      <IonContent fullscreen className="bg-gray-50">
        {children}
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="bg-gray-100 px-6 py-10 text-center text-sm text-gray-500">
          © 2026 Municipalidad de Santo Domingo. Todos los derechos reservados.
        </div>
      </IonFooter>
    </IonPage>
  )
}