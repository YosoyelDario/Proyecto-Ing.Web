import { useState, useMemo } from 'react'
import { AuthService } from '../services/AuthServices'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonNote,
} from '@ionic/react'
import { arrowBack } from 'ionicons/icons'
import { Link, useNavigate } from 'react-router-dom'
import LogoSantoDomingo from '../components/LogoSantoDomingo'
import InputTexto       from '../components/InputTexto'
import RutInput         from '../components/Rutinput'
import EmailInput       from '../components/Emailinput'
import PasswordInput    from '../components/PasswordInput'
import SelectInput      from '../components/Selectinput'
import BotonPrimario    from '../components/BotonPrimario'
import PageTransition   from '../components/PageTransition'
import '../styles/Register.css'

/* ─── Datos de regiones y comunas ────────────────────────────────────── */

const REGIONES_COMUNAS: Record<string, string[]> = {
  'Arica y Parinacota':           ['Arica', 'Camarones', 'General Lagos', 'Putre'],
  'Tarapacá':                     ['Alto Hospicio', 'Camiña', 'Colchane', 'Huara', 'Iquique', 'Pica', 'Pozo Almonte'],
  'Antofagasta':                  ['Antofagasta', 'Calama', 'María Elena', 'Mejillones', 'Ollagüe', 'San Pedro de Atacama', 'Sierra Gorda', 'Taltal', 'Tocopilla'],
  'Atacama':                      ['Caldera', 'Chañaral', 'Copiapó', 'Diego de Almagro', 'Freirina', 'Huasco', 'Tierra Amarilla', 'Vallenar'],
  'Coquimbo':                     ['Andacollo', 'Canela', 'Combarbalá', 'Coquimbo', 'Illapel', 'La Higuera', 'La Serena', 'Los Vilos', 'Monte Patria', 'Ovalle', 'Paihuano', 'Punitaqui', 'Río Hurtado', 'Salamanca', 'Vicuña'],
  'Valparaíso':                   ['Algarrobo', 'Cabildo', 'Calera', 'Calle Larga', 'Cartagena', 'Casablanca', 'Catemu', 'Concón', 'El Quisco', 'El Tabo', 'Hijuelas', 'Isla de Pascua', 'Juan Fernández', 'La Cruz', 'La Ligua', 'Limache', 'Llaillay', 'Los Andes', 'Nogales', 'Olmué', 'Panquehue', 'Papudo', 'Petorca', 'Puchuncaví', 'Putaendo', 'Quillota', 'Quilpué', 'Quintero', 'Rinconada', 'San Antonio', 'San Esteban', 'San Felipe', 'Santa María', 'Santo Domingo', 'Valparaíso', 'Villa Alemana', 'Viña del Mar', 'Zapallar'],
  "O'Higgins":                    ['Chépica', 'Chimbarongo', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'La Estrella', 'Las Cabras', 'Litueche', 'Lolol', 'Machalí', 'Malloa', 'Marchigüe', 'Mostazal', 'Nancagua', 'Navidad', 'Olivar', 'Palmilla', 'Paredones', 'Peralillo', 'Peumo', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pumanque', 'Quinta de Tilcoco', 'Rancagua', 'Rengo', 'Requínoa', 'San Fernando', 'San Vicente', 'Santa Cruz'],
  'Maule':                        ['Cauquenes', 'Chanco', 'Colbún', 'Constitución', 'Curepto', 'Curicó', 'Empedrado', 'Hualañé', 'Licantén', 'Linares', 'Longaví', 'Maule', 'Molina', 'Parral', 'Pelarco', 'Pelluhue', 'Pencahue', 'Rauco', 'Retiro', 'Río Claro', 'Romeral', 'Sagrada Familia', 'San Clemente', 'San Javier', 'San Rafael', 'Talca', 'Teno', 'Vichuquén', 'Villa Alegre', 'Yerbas Buenas'],
  'Ñuble':                        ['Bulnes', 'Chillán', 'Chillán Viejo', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'],
  'Biobío':                       ['Alto Biobío', 'Antuco', 'Arauco', 'Cabrero', 'Cañete', 'Chiguayante', 'Concepción', 'Contulmo', 'Coronel', 'Curanilahue', 'Florida', 'Hualpén', 'Hualqui', 'Laja', 'Lebu', 'Los Álamos', 'Los Ángeles', 'Lota', 'Mulchén', 'Nacimiento', 'Negrete', 'Penco', 'Quilaco', 'Quilleco', 'San Pedro de la Paz', 'San Rosendo', 'Santa Bárbara', 'Santa Juana', 'Talcahuano', 'Tirúa', 'Tomé', 'Tucapel', 'Yumbel'],
  'La Araucanía':                 ['Angol', 'Carahue', 'Cholchol', 'Collipulli', 'Cunco', 'Curacautín', 'Curarrehue', 'Ercilla', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Purén', 'Renaico', 'Saavedra', 'Temuco', 'Teodoro Schmidt', 'Toltén', 'Traiguén', 'Victoria', 'Vilcún', 'Villarrica'],
  'Los Ríos':                     ['Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno', 'Valdivia'],
  'Los Lagos':                    ['Ancud', 'Calbuco', 'Castro', 'Chaitén', 'Chonchi', 'Cochamó', 'Curaco de Vélez', 'Dalcahue', 'Fresia', 'Frutillar', 'Futaleufú', 'Hualaihué', 'Llanquihue', 'Los Muermos', 'Maullín', 'Osorno', 'Palena', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 'Puqueldón', 'Purranque', 'Puyehue', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Río Negro', 'San Juan de la Costa', 'San Pablo'],
  'Aysén':                        ['Aysén', 'Chile Chico', 'Cisnes', 'Cochrane', 'Coyhaique', 'Guaitecas', 'Lago Verde', "O'Higgins", 'Río Ibáñez', 'Tortel'],
  'Magallanes':                   ['Antártica', 'Cabo de Hornos', 'Laguna Blanca', 'Natales', 'Porvenir', 'Primavera', 'Punta Arenas', 'Río Verde', 'San Gregorio', 'Timaukel', 'Torres del Paine'],
  'Metropolitana':                ['Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví', 'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa', 'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia', 'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo', 'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante', 'Tiltil', 'Vitacura'],
}

const REGIONES = Object.keys(REGIONES_COMUNAS).map(r => ({ value: r, label: r }))

export default function Register() {
  const navigate = useNavigate()

  const [nombre, setNombre]     = useState('')
  const [rut, setRut]           = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [region, setRegion]     = useState('')
  const [comuna, setComuna]     = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [errorTerminos, setErrorTerminos]   = useState('')

  const comunasOpciones = useMemo(() => {
    if (!region) return []
    return (REGIONES_COMUNAS[region] || []).map(c => ({ value: c, label: c }))
  }, [region])

  const handleRegionChange = (valor: string) => {
    setRegion(valor)
    setComuna('')
  }

  const [errorRegistro, setErrorRegistro] = useState('')

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
    if (!region || !comuna) return

    try {
      await AuthService.registrarUsuario({
        rut,
        nombre_completo: nombre,
        email,
        password,
        region,
        comuna
      })
      navigate('/register-success')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorRegistro(error.message)
    }
  }

  return (
    <IonPage className="register-page">

      {/* ── Header solo con botón volver ── */}
      <IonHeader className="ion-no-border register-header">
        <IonToolbar className="safe-area-top">
          <IonButtons slot="start">
            <IonButton className="register-btn-volver" onClick={() => navigate('/')}>
              <IonIcon slot="start" icon={arrowBack} />
              Inicio
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#f4faf9' } as React.CSSProperties}>
        <div
          className="
            min-h-screen flex flex-col items-center justify-center
            px-6 py-12
            font-['DM_Sans',sans-serif]
          "
        >
          <PageTransition variante="fadeUp" className="w-full max-w-sm">

            {/* ── Logo ── */}
            <div className="mb-8 flex justify-center">
              <LogoSantoDomingo />
            </div>

            {/* ── Encabezado ── */}
            <IonText>
              <h1 className="text-[28px] font-semibold text-[#3aada0]! mb-1">
                Crear cuenta
              </h1>
            </IonText>
            <IonNote className="register-subtitle">
              Completa tus datos para registrarte
            </IonNote>

            {/* ── Formulario dentro de IonCard ── */}
            <IonCard className="register-card">
              <IonCardContent>
                <div className="flex flex-col gap-4">

                  <InputTexto
                    id="nombre"
                    label="Nombre completo"
                    type="text"
                    autoComplete="name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                  />

                  <RutInput
                    id="rut"
                    value={rut}
                    onChange={setRut}
                    required
                  />

                  <EmailInput
                    id="reg-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <PasswordInput
                    id="reg-password"
                    label="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />

                  <PasswordInput
                    id="confirm-password"
                    label="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                    confirmar={password}
                  />

                  {/* Región y Comuna con IonGrid */}
                  <IonGrid className="register-grid">
                    <IonRow>
                      <IonCol>
                        <SelectInput
                          id="region"
                          label="Región"
                          value={region}
                          onChange={handleRegionChange}
                          opciones={REGIONES}
                          placeholder="Seleccionar..."
                          required
                        />
                      </IonCol>
                      <IonCol>
                        <SelectInput
                          id="comuna"
                          label="Comuna"
                          value={comuna}
                          onChange={setComuna}
                          opciones={comunasOpciones}
                          placeholder={region ? 'Seleccionar...' : 'Elige región'}
                          required
                          disabled={!region}
                        />
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  {/* Términos y condiciones */}
                  <div className="flex items-start gap-3 mt-2">
                    <input
                      type="checkbox"
                      id="terminos"
                      checked={aceptaTerminos}
                      onChange={(e) => {
                        setAceptaTerminos(e.target.checked)
                        if (e.target.checked) setErrorTerminos('')
                      }}
                      className="mt-1 w-4 h-4 accent-[#3aada0]"
                    />
                    <label htmlFor="terminos" className="text-[13px] text-[#7a8a9a] leading-snug">
                      Acepto los términos y condiciones de uso.
                    </label>
                  </div>

                  {errorTerminos && (
                    <IonText color="danger">
                      <p className="-mt-2 text-[12px] m-0" role="alert">
                        {errorTerminos}
                      </p>
                    </IonText>
                  )}

                  {/* Renderizado de error de servidor */}
                  {errorRegistro && (
                    <IonText color="danger">
                      <p className="mt-1 mb-2 text-[14px] font-medium text-center" role="alert">
                        {errorRegistro}
                      </p>
                    </IonText>
                  )}

                  <BotonPrimario
                    onClick={handleSubmit}
                    variante="solido"
                    fullWidth
                    type="submit"
                    className="py-5! text-base! tracking-wider! mt-2"
                  >
                    Crear cuenta
                  </BotonPrimario>
                </div>
              </IonCardContent>
            </IonCard>

            {/* ── Footer ── */}
            <IonGrid className="register-footer-grid">
              <IonRow>
                <IonCol className="text-center">
                  <IonNote className="register-footer-text">
                    ¿Ya tienes cuenta?{' '}
                    <Link
                      to="/login"
                      className="text-[#3aada0] font-medium hover:underline"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
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