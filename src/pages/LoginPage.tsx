import React, { useState } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonLoading,
    useIonToast,
} from '@ionic/react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const history = useHistory();
    const [present] = useIonToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await login(email, password);
            history.push('/category/Work');
        } catch (error) {
            present({
                message: 'Failed to sign in. Please check your credentials.',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <div style={{
                paddingTop: 'var(--ion-safe-area-top, 20px)',
                backgroundColor: 'var(--ion-toolbar-background)'
            }}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Login</IonTitle>
                    </IonToolbar>
                </IonHeader>
            </div>

            <IonContent className="ion-padding">
                <form onSubmit={handleLogin}>
                    <IonList>
                        <IonItem>
                            <IonLabel position="stacked">Email</IonLabel>
                            <IonInput
                                type="email"
                                value={email}
                                onIonChange={e => setEmail(e.detail.value!)}
                                required
                            />
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Password</IonLabel>
                            <IonInput
                                type="password"
                                value={password}
                                onIonChange={e => setPassword(e.detail.value!)}
                                required
                            />
                        </IonItem>
                    </IonList>

                    <div className="ion-padding">
                        <IonButton expand="block" type="submit">
                            Login
                        </IonButton>
                        <IonButton
                            expand="block"
                            fill="clear"
                            routerLink="/register"
                        >
                            Create Account
                        </IonButton>
                    </div>
                </form>

                <IonLoading isOpen={loading} message="Please wait..." />
            </IonContent>
        </IonPage>
    );
};

export default LoginPage;