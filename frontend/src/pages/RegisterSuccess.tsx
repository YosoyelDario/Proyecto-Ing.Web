import { IonPage, IonContent, IonText, IonIcon } from '@ionic/react'
import { checkmarkCircleOutline } from 'ionicons/icons'
import { useNavigate } from 'react-router-dom'
import BotonPrimario from '../components/BotonPrimario'
import PageTransition from '../components/PageTransition'

export default function RegisterSuccess() {
  const navigate = useNavigate()

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 font-['DM_Sans',sans-serif]">
          <PageTransition variante="fadeUp" className="w-full max-w-sm flex flex-col items-center text-center">
            
            <IonIcon 
              icon={checkmarkCircleOutline} 
              style={{ fontSize: '80px', color: '#3aada0', marginBottom: '16px' }} 
            />
            
            <IonText>
              <h1 className="text-[28px] font-semibold text-[#3aada0]! mb-2">
                Cuenta Creada
              </h1>
            </IonText>
            
            <IonText color="medium" className="mb-8">
              <p className="text-[15px] m-0">
                Tu registro se ha completado exitosamente. Ya puedes iniciar sesión en la plataforma.
              </p>
            </IonText>
            
            <BotonPrimario
              onClick={() => navigate('/login')}
              variante="solido"
              fullWidth
              className="py-5! text-base! tracking-wider!"
            >
              Iniciar Sesión
            </BotonPrimario>

          </PageTransition>
        </div>
      </IonContent>
    </IonPage>
  )
}