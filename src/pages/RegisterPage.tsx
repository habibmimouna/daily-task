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
import { firestoreService } from '../firebase/firestore';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const history = useHistory();
    const [present] = useIonToast();

    const validateForm = () => {
        if (!email || !password || !confirmPassword || !name || !phoneNumber) {
            present({
                message: 'All fields are required',
                duration: 3000,
                color: 'danger'
            });
            return false;
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            present({
                message: 'Please enter a valid phone number (e.g., +1234567890)',
                duration: 3000,
                color: 'danger'
            });
            return false;
        }

        if (password !== confirmPassword) {
            present({
                message: 'Passwords do not match',
                duration: 3000,
                color: 'danger'
            });
            return false;
        }

        if (password.length < 6) {
            present({
                message: 'Password must be at least 6 characters long',
                duration: 3000,
                color: 'danger'
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            present({
                message: 'Please enter a valid email address',
                duration: 3000,
                color: 'danger'
            });
            return false;
        }

        return true;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            await register(email, password);
            await new Promise(resolve => setTimeout(resolve, 1000));

            await firestoreService.createUserProfile({
                displayName: name,
                email,
                phoneNumber
            });

            history.push('/category/Work');
        } catch (error: any) {
            console.error('Registration error:', error);
            let errorMessage = 'Failed to create account.';

            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Email/password accounts are not enabled.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak.';
            } else if (error.message.includes('insufficient permissions')) {
                errorMessage = 'Server error. Please try again.';
            }

            present({
                message: errorMessage,
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
                        <IonTitle>Create Account</IonTitle>
                    </IonToolbar>
                </IonHeader>
            </div>

            <IonContent className="ion-padding">
                <form onSubmit={handleRegister}>
                    <IonList>
                        <IonItem>
                            <IonLabel position="stacked">Name</IonLabel>
                            <IonInput
                                type="text"
                                value={name}
                                onIonChange={e => setName(e.detail.value!)}
                                required
                            />
                        </IonItem>

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
                            <IonLabel position="stacked">Phone Number</IonLabel>
                            <IonInput
                                type="tel"
                                value={phoneNumber}
                                onIonChange={e => setPhoneNumber(e.detail.value!)}
                                placeholder="+1234567890"
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

                        <IonItem>
                            <IonLabel position="stacked">Confirm Password</IonLabel>
                            <IonInput
                                type="password"
                                value={confirmPassword}
                                onIonChange={e => setConfirmPassword(e.detail.value!)}
                                required
                            />
                        </IonItem>
                    </IonList>

                    <div className="ion-padding">
                        <IonButton expand="block" type="submit">
                            Register
                        </IonButton>
                        <IonButton
                            expand="block"
                            fill="clear"
                            routerLink="/login"
                        >
                            Already have an account? Login
                        </IonButton>
                    </div>
                </form>

                <IonLoading isOpen={loading} message="Creating account..." />
            </IonContent>
        </IonPage>
    );
};

export default RegisterPage;