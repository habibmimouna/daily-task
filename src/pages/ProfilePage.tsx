import React, { useState, useEffect, useRef } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButtons,
    IonMenuButton,
    IonLoading,
    useIonToast,
    IonAvatar,
    IonActionSheet,
    IonIcon,
} from '@ionic/react';
import { camera, image, close } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router';
import { firestoreService } from '../firebase/firestore';
import { storageService } from '../firebase/storage';
import { UserData } from '../types/user';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const ProfilePage: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const history = useHistory();
    const [present] = useIonToast();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const data = await firestoreService.getUserProfile();
                if (data) {
                    setUserData(data);
                    setDisplayName(data.displayName);
                    setPhoneNumber(data.phoneNumber);
                }
            } catch (error) {
                present({
                    message: 'Failed to load user profile',
                    duration: 3000,
                    color: 'danger'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [present]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const downloadURL = await storageService.uploadProfilePicture(file);
            await firestoreService.updateUserProfile({
                ...userData!,
                profilePictureUrl: downloadURL
            });

            setUserData(prev => prev ? { ...prev, profilePictureUrl: downloadURL } : null);

            present({
                message: 'Profile picture updated successfully',
                duration: 3000,
                color: 'success'
            });
        } catch (error) {
            present({
                message: 'Failed to update profile picture',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera
            });

            if (image.base64String) {
                setLoading(true);

                const response = await fetch(`data:image/jpeg;base64,${image.base64String}`);
                const blob = await response.blob();
                const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

                const downloadURL = await storageService.uploadProfilePicture(file);
                await firestoreService.updateUserProfile({
                    ...userData!,
                    profilePictureUrl: downloadURL
                });

                setUserData(prev => prev ? { ...prev, profilePictureUrl: downloadURL } : null);

                present({
                    message: 'Profile picture updated successfully',
                    duration: 3000,
                    color: 'success'
                });
            }
        } catch (error) {
            present({
                message: 'Failed to take photo',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!displayName.trim() || !phoneNumber.trim()) {
            present({
                message: 'Display name and phone number are required',
                duration: 3000,
                color: 'warning'
            });
            return;
        }

        try {
            setLoading(true);
            await firestoreService.updateUserProfile({
                ...userData!,
                displayName,
                phoneNumber,
            });

            present({
                message: 'Profile updated successfully',
                duration: 3000,
                color: 'success'
            });
        } catch (error) {
            present({
                message: 'Failed to update profile',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            history.push('/login');
        } catch (error) {
            present({
                message: 'Failed to log out',
                duration: 3000,
                color: 'danger'
            });
        }
    };

    return (
        <IonPage>
            <div style={{
                paddingTop: 'var(--ion-safe-area-top, 20px)',
                
            }}>
                <IonHeader className="ion-no-border">
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>Profile</IonTitle>
                    </IonToolbar>
                </IonHeader>
            </div>

            <IonContent className="ion-padding">
                <div className="ion-text-center ion-padding">
                    <IonAvatar
                        style={{
                            margin: '0 auto',
                            width: '120px',
                            height: '120px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setShowActionSheet(true)}
                    >
                        <img
                            src={userData?.profilePictureUrl ||
                                `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=random`}
                            alt="avatar"
                        />
                    </IonAvatar>
                    <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => setShowActionSheet(true)}
                    >
                        Change Photo
                    </IonButton>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileUpload}
                />

                <IonActionSheet
                    isOpen={showActionSheet}
                    onDidDismiss={() => setShowActionSheet(false)}
                    buttons={[
                        {
                            text: 'Take Photo',
                            icon: camera,
                            handler: () => {
                                handleTakePhoto();
                            }
                        },
                        {
                            text: 'Choose from Gallery',
                            icon: image,
                            handler: () => {
                                fileInputRef.current?.click();
                            }
                        },
                        {
                            text: 'Cancel',
                            icon: close,
                            role: 'cancel'
                        }
                    ]}
                />

                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">Display Name</IonLabel>
                        <IonInput
                            value={displayName}
                            onIonChange={e => setDisplayName(e.detail.value!)}
                            placeholder="Enter your display name"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Phone Number</IonLabel>
                        <IonInput
                            value={phoneNumber}
                            onIonChange={e => setPhoneNumber(e.detail.value!)}
                            placeholder="Enter your phone number"
                            type="tel"
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel position="stacked">Email</IonLabel>
                        <IonInput
                            value={currentUser?.email}
                            readonly
                            disabled
                        />
                    </IonItem>
                </IonList>

                <div className="ion-padding">
                    <IonButton expand="block" onClick={handleUpdateProfile}>
                        Update Profile
                    </IonButton>
                    <IonButton expand="block" color="danger" onClick={handleLogout}>
                        Logout
                    </IonButton>
                </div>

                <IonLoading isOpen={loading} message="Please wait..." />
            </IonContent>
        </IonPage>
    );
};

export default ProfilePage;