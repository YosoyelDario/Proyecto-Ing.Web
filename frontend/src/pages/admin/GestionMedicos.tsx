import React, { useState } from 'react';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonButton, IonModal, 
  IonInput, IonSelect, IonSelectOption, IonItemSliding, IonItemOptions, IonItemOption 
} from '@ionic/react';
import { crearMedico, eliminarMedico } from '../../services/medicoServices';

export const GestionMedicos: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [rut, setRut] = useState('');
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState<number>(1);

  const handleCrear = async () => {
    try {
      await crearMedico({ rut, nombre, id_especialidad: especialidad });
      setShowModal(false);
      // Agregar recarga de datos local o actualización de estado
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gestión de Médicos y Agendas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton onClick={() => setShowModal(true)} expand="block">Agregar Médico</IonButton>
        
        {/* Simulación de listado con opciones de deslizamiento para editar/eliminar */}
        <IonList>
          <IonItemSliding>
            <IonItem>
              <IonLabel>
                <h2>Dr. Matias Fernandez</h2>
                <p>Medicina General</p>
              </IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption color="danger" onClick={() => eliminarMedico(16)}>Eliminar</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        </IonList>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nuevo Profesional</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput label="RUT" value={rut} onIonInput={e => setRut(e.detail.value!)} />
            <IonInput label="Nombre Completo" value={nombre} onIonInput={e => setNombre(e.detail.value!)} />
            <IonSelect label="Especialidad" value={especialidad} onIonChange={e => setEspecialidad(e.detail.value)}>
              <IonSelectOption value={1}>Medicina General</IonSelectOption>
              <IonSelectOption value={2}>Pediatría</IonSelectOption>
              <IonSelectOption value={3}>Dermatología</IonSelectOption>
            </IonSelect>
            <IonButton expand="block" onClick={handleCrear}>Guardar</IonButton>
            <IonButton expand="block" color="light" onClick={() => setShowModal(false)}>Cancelar</IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};