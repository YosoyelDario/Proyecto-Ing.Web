import { 
  IonButton, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonText
} from '@ionic/react'
import { Layout } from '../components/Layout'

export function Home() {
  return (
    <Layout>
      {/* Área Hero: Degradado y Tipografía */}
      <section className="bg-linear-to-r from-teal-500 to-gray-400 px-4 py-16 lg:px-10">
        <IonGrid className="mx-auto max-w-[350]">
          <IonRow className="min-h-[40vh] items-center">
            <IonCol size="12" sizeLg="7">
              <IonText color="light">
                <h1 className="text-5xl font-extrabold leading-tight tracking-tight lg:text-7xl">
                  Deseas Agendar Tu Cita Medica?
                </h1>
              </IonText>
              
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {/* Botón navega a /agendar */}
                <IonButton
                  color="tertiary"
                  size="large"
                  className="font-bold tracking-wide"
                  routerLink="/agendar"
                >
                  Agenda Aqui!
                </IonButton>
                
                <IonButton fill="clear" color="light" size="large" className="font-semibold">
                  Modifica Tu Cita Medica
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </section>

      {/* Área de Características: Sistema de Tarjetas */}
      <section className="bg-white px-4 py-16 lg:px-10">
        <IonGrid className="mx-auto max-w-[350]">
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard className="m-0 bg-teal-600 shadow-xl">
                <IonCardHeader>
                  <div className="mb-4 h-16 w-20 rounded bg-white/30"></div>
                  <IonCardTitle className="text-xl font-bold text-white">Trámites Digitales</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="text-white/90 text-base">
                  Accede a todos los servicios municipales desde la plataforma integrada.
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="4">
              <IonCard className="m-0 bg-teal-600 shadow-xl">
                <IonCardHeader>
                  <div className="mb-4 h-16 w-20 rounded bg-white/30"></div>
                  <IonCardTitle className="text-xl font-bold text-white">Asistencia Rápida</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="text-white/90 text-base">
                  Soporte continuo para la gestión de horas médicas y consultas ciudadanas.
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="4">
              <IonCard className="m-0 bg-teal-600 shadow-xl">
                <IonCardHeader>
                  <div className="mb-4 h-16 w-20 rounded bg-white/30"></div>
                  <IonCardTitle className="text-xl font-bold text-white">Registro Local</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="text-white/90 text-base">
                  Inscripción directa a los beneficios de la comuna con validación biométrica.
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </section>
    </Layout>
  )
}