import { useState, useMemo, useEffect } from 'react'
import { AuthService } from '../services/AuthServices'
import {
  IonPage, IonContent, IonHeader, IonToolbar, 
  IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonText, IonNote,
} from '@ionic/react'
import { Link, useNavigate } from 'react-router-dom'
import LogoSantoDomingo from '../components/LogoSantoDomingo'
import InputTexto       from '../components/InputTexto'
import RutInput         from '../components/Rutinput'
import EmailInput       from '../components/Emailinput'
import PasswordInput    from '../components/PasswordInput'
import SelectInput      from '../components/Selectinput'
import BotonVolver from '../components/BotonVolver'
import BotonPrimario    from '../components/BotonPrimario'
import PageTransition   from '../components/PageTransition'
import '../styles/Register.css'

export default function Register() {
  const navigate = useNavigate()

  // ── Estado regiones desde API ──
  const [regionesComunas, setRegionesComunas] = useState<Record<string, string[]>>({})

  useEffect(() => {
    fetch('http://localhost:3000/api/regiones')
      .then(res => res.json())
      .then(data => setRegionesComunas(data))
  }, [])

  // ── Estado formulario ──
  const [nombre,          setNombre]          = useState('')
  const [rut,             setRut]             = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [region,          setRegion]          = useState('')
  const [comuna,          setComuna]          = useState('')
  const [aceptaTerminos,  setAceptaTerminos]  = useState(false)
  const [errorTerminos,   setErrorTerminos]   = useState('')
  const [errorRegistro,   setErrorRegistro]   = useState('')

  // ── Opciones derivadas ──
  const regionesOpciones = useMemo(() =>
    Object.keys(regionesComunas).map(r => ({ value: r, label: r }))
  , [regionesComunas])

  const comunasOpciones = useMemo(() => {
    if (!region) return []
    return (regionesComunas[region] || []).map(c => ({ value: c, label: c }))
  }, [region, regionesComunas])

  const handleRegionChange = (valor: string) => {
    setRegion(valor)
    setComuna('')
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!aceptaTerminos) {
      setErrorTerminos('Debes aceptar los términos y condiciones.')
      return
    }
    setErrorTerminos('')
    setErrorRegistro('')

    if (!nombre.trim() || !rut.trim() || !email.trim()) return
    if (password.length < 8) return
    if (password !== confirmPassword) return
    if (!region || !comuna) {
      setErrorRegistro('Debes seleccionar región y comuna válidas.')
      return
    }

    if (!Object.keys(regionesComunas).includes(region) || !regionesComunas[region]?.includes(comuna)) {
      setErrorRegistro('Debes seleccionar una región y comuna válidas.')
      return
    }

    try {
      await AuthService.registrarUsuario({ rut, nombre_completo: nombre, email, password, region, comuna })
      navigate('/register-success')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorRegistro(error.message)
    }
  }

  return (
    <IonPage className="register-page">
      <IonHeader className="ion-no-border register-header">
        <IonToolbar className="safe-area-top">
          <div className="absolute top-4 left-4 z-10">
            <BotonVolver to="/" label="Inicio" />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 font-['DM_Sans',sans-serif]">
          <PageTransition variante="fadeUp" className="w-full max-w-sm">

            <div className="mb-8 flex justify-center">
              <LogoSantoDomingo />
            </div>

            <IonText>
              <h1 className="text-[28px] font-semibold text-[#3aada0]! mb-1">Crear cuenta</h1>
            </IonText>
            <IonNote className="register-subtitle">Completa tus datos para registrarte</IonNote>

            <IonCard className="register-card">
              <IonCardContent>
                <div className="flex flex-col gap-4">

                  <InputTexto id="nombre" label="Nombre completo" type="text"
                    autoComplete="name" value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan Pérez" required />

                  <RutInput id="rut" value={rut} onChange={setRut} required />

                  <EmailInput id="reg-email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />

                  <PasswordInput id="reg-password" label="Contraseña" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={8} />

                  <PasswordInput id="confirm-password" label="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña" required confirmar={password} />

                  <IonGrid className="register-grid">
                    <IonRow>
                      <IonCol>
                        <SelectInput id="region" label="Región" value={region}
                          onChange={handleRegionChange}
                          opciones={regionesOpciones}
                          placeholder="Seleccionar..." required />
                      </IonCol>
                      <IonCol>
                        <SelectInput id="comuna" label="Comuna" value={comuna}
                          onChange={setComuna}
                          opciones={comunasOpciones}
                          placeholder={region ? 'Seleccionar...' : 'Elige región'}
                          required disabled={!region} />
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <div className="flex items-start gap-3 mt-2">
                    <input type="checkbox" id="terminos" checked={aceptaTerminos}
                      onChange={(e) => {
                        setAceptaTerminos(e.target.checked)
                        if (e.target.checked) setErrorTerminos('')
                      }}
                      className="mt-1 w-4 h-4 accent-[#3aada0]" />
                    <label htmlFor="terminos" className="text-[13px] text-[#7a8a9a] leading-snug">
                      Acepto los términos y condiciones de uso.
                    </label>
                  </div>

                  {errorTerminos && (
                    <IonText color="danger">
                      <p className="-mt-2 text-[12px] m-0" role="alert">{errorTerminos}</p>
                    </IonText>
                  )}

                  {errorRegistro && (
                    <IonText color="danger">
                      <p className="mt-1 mb-2 text-[14px] font-medium text-center" role="alert">{errorRegistro}</p>
                    </IonText>
                  )}

                  <BotonPrimario onClick={handleSubmit} variante="solido" fullWidth
                    type="submit" className="py-5! text-base! tracking-wider! mt-2">
                    Crear cuenta
                  </BotonPrimario>

                </div>
              </IonCardContent>
            </IonCard>

            <IonGrid className="register-footer-grid">
              <IonRow>
                <IonCol className="text-center">
                  <IonNote className="register-footer-text">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-[#3aada0] font-medium hover:underline"
                      style={{ WebkitTapHighlightColor: 'transparent' }}>
                      Inicia sesión
                    </Link>
                  </IonNote>
                </IonCol>
              </IonRow>
            </IonGrid>

          </PageTransition>
        </div>
      </IonContent>
    </IonPage>
  )
}