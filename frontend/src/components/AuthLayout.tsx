import { IonPage, IonContent } from '@ionic/react';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <IonPage>
    <IonContent fullscreen>
      <div className="min-h-screen flex font-['DM_Sans',sans-serif]">
        <div
          className="hidden md:flex flex-1 relative overflow-hidden"
          style={{ backgroundColor: '#3aada0' }}
          aria-hidden="true"
        >
          <div className="absolute top-16 left-12 w-16 h-16 rounded-full border border-white/20" />
          <div className="absolute bottom-20 left-20 w-10 h-10 rounded-full border border-white/20" />
          <div className="absolute top-1/2 right-8 w-6 h-6 rounded-full border border-white/20" />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <img
              src="/assets/hero.png"
              alt=""
              className="w-full max-w-105 h-auto object-cover rounded-2xl"
              style={{ aspectRatio: '4/5' }}
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white md:px-16 md:max-w-130">
          {children}
        </div>
      </div>
    </IonContent>
  </IonPage>
);