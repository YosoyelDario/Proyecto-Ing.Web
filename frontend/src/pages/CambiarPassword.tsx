import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IonPage, IonContent, IonHeader, IonToolbar,
  IonCard, IonCardContent, IonText, IonNote
} from '@ionic/react'
import BotonVolver from '../components/BotonVolver'
import BotonPrimario from '../components/BotonPrimario'
import PasswordInput from '../components/PasswordInput'
import PageTransition from '../components/PageTransition'
import { apiFetch } from '../services/AuthServices'

export default function CambiarPassword() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Completa todos los campos.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch('/api/usuarios/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await response.json()
      setSuccess(data.mensaje || 'Contraseña actualizada correctamente.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="absolute top-4 left-4 z-10">
            <BotonVolver to="/" label="Inicio" />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <PageTransition variante="fadeUp" duracion={500}>
          <div className="min-h-screen px-6 py-10 font-['DM_Sans',sans-serif] max-w-2xl mx-auto">
            <IonText>
              <h1 className="text-[26px] font-semibold text-[#3aada0] mb-1">Cambiar contraseña</h1>
            </IonText>
            <IonNote className="text-[14px] text-[#7a8a9a] block mb-6">
              Actualiza tu contraseña de acceso de manera segura.
            </IonNote>

            <IonCard className="rounded-2xl shadow-sm">
              <IonCardContent>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <PasswordInput
                    id="current-password"
                    label="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />

                  <PasswordInput
                    id="new-password"
                    label="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />

                  <PasswordInput
                    id="confirm-password"
                    label="Confirmar nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    confirmar={newPassword}
                  />

                  {error && (
                    <IonText color="danger">
                      <p className="text-[14px] font-medium">{error}</p>
                    </IonText>
                  )}

                  {success && (
                    <IonText color="success">
                      <p className="text-[14px] font-medium">{success}</p>
                    </IonText>
                  )}

                  <BotonPrimario
                    type="submit"
                    variante="outline"
                    fullWidth
                    className="mb-4"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                  </BotonPrimario>
                </form>
              </IonCardContent>
            </IonCard>
          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  )
}
