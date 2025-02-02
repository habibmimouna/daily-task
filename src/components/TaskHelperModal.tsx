import React, { useState, useEffect } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonLoading,
    useIonToast,
    IonBadge
} from '@ionic/react';
import { firestoreService } from '../firebase/firestore';

interface TaskHelperModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string;
}

const TaskHelperModal: React.FC<TaskHelperModalProps> = ({ isOpen, onClose, taskId }) => {
    const [helperPhone, setHelperPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [helpers, setHelpers] = useState<Array<any>>([]);
    const [present] = useIonToast();

    useEffect(() => {
        if (isOpen) {
            loadHelpers();
        }
    }, [isOpen, taskId]);

    const loadHelpers = async () => {
        try {
            const taskHelpers = await firestoreService.getTaskHelpers(taskId);
            setHelpers(taskHelpers);
        } catch (error) {
            console.error('Error loading helpers:', error);
        }
    };

    const handleAddHelper = async () => {
        if (!helperPhone) {
            present({
                message: 'Please enter a phone number',
                duration: 3000,
                color: 'danger'
            });
            return;
        }

        try {
            setLoading(true);

            const user = await firestoreService.findUserByPhone(helperPhone);
            if (!user) {
                present({
                    message: 'No user found with this phone number',
                    duration: 3000,
                    color: 'danger'
                });
                return;
            }

            await firestoreService.addTaskHelper(taskId, {
                phoneNumber: helperPhone,
                displayName: user.displayName,
                status: 'pending'
            });

            setHelperPhone('');
            present({
                message: 'Helper added successfully',
                duration: 3000,
                color: 'success'
            });

            await loadHelpers();
        } catch (error) {
            console.error('Error adding helper:', error);
            present({
                message: 'Failed to add helper',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'success';
            case 'rejected':
                return 'danger';
            default:
                return 'warning';
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Manage Task Helpers</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">Helper's Phone Number</IonLabel>
                        <IonInput
                            type="tel"
                            value={helperPhone}
                            onIonChange={e => setHelperPhone(e.detail.value!)}
                            placeholder="+1234567890"
                        />
                    </IonItem>
                </IonList>

                <div className="ion-padding">
                    <IonButton expand="block" onClick={handleAddHelper}>
                        Add Helper
                    </IonButton>
                </div>

                <IonList>
                    <IonItem>
                        <IonLabel>
                            <h2>Current Helpers</h2>
                        </IonLabel>
                    </IonItem>
                    {helpers.map((helper) => (
                        <IonItem key={helper.id}>
                            <IonLabel>
                                <h3>{helper.displayName}</h3>
                                <p>{helper.phoneNumber}</p>
                            </IonLabel>
                            <IonBadge color={getStatusColor(helper.status)}>
                                {helper.status}
                            </IonBadge>
                        </IonItem>
                    ))}
                </IonList>

                <div className="ion-padding">
                    <IonButton expand="block" color="medium" onClick={onClose}>
                        Close
                    </IonButton>
                </div>

                <IonLoading isOpen={loading} message="Please wait..." />
            </IonContent>
        </IonModal>
    );
};

export default TaskHelperModal;