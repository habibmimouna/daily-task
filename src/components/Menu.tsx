import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonAvatar,
  IonSkeletonText,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import {
  briefcaseOutline,
  briefcaseSharp,
  personOutline,
  personSharp,
  cartOutline,
  cartSharp,
  settingsOutline,
  settingsSharp,
} from 'ionicons/icons';
import './Menu.css';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { firestoreService } from '../firebase/firestore';
import { UserData } from '../types/user'; // Make sure to import UserData type

const appPages = [
  {
    title: 'Work Tasks',
    url: '/category/Work',
    iosIcon: briefcaseOutline,
    mdIcon: briefcaseSharp,
    category: 'Work'
  },
  {
    title: 'Personal Tasks',
    url: '/category/Personal',
    iosIcon: personOutline,
    mdIcon: personSharp,
    category: 'Personal'
  },
  {
    title: 'Shopping List',
    url: '/category/Shopping',
    iosIcon: cartOutline,
    mdIcon: cartSharp,
    category: 'Shopping'
  }
];

const Menu: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    console.log("test");
    
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await firestoreService.getUserProfile();
        console.log("teststts",data);
        
        if (data) {
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <div className="ion-padding-horizontal ion-padding-top">
            <IonAvatar style={{ width: '80px', height: '80px', margin: '0 auto 1rem' }}>
              {loading ? (
                <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
              ) : (
                <img
                  src={userData?.profilePictureUrl || 
                    `https://ui-avatars.com/api/?name=${userData?.displayName || 'User'}&background=random`}
                  alt="avatar"
                />
              )}
            </IonAvatar>
            <IonListHeader>
              {loading ? (
                <IonSkeletonText animated style={{ width: '150px' }} />
              ) : (
                userData?.displayName || 'User'
              )}
            </IonListHeader>
            <IonNote>
              {loading ? (
                <IonSkeletonText animated style={{ width: '200px' }} />
              ) : (
                currentUser?.email
              )}
            </IonNote>
          </div>

          {appPages.map((appPage, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                className={location.pathname === appPage.url ? 'selected' : ''}
                routerLink={appPage.url}
                routerDirection="none"
                lines="none"
                detail={false}
              >
                <IonIcon 
                  aria-hidden="true" 
                  slot="start" 
                  ios={appPage.iosIcon} 
                  md={appPage.mdIcon} 
                />
                <IonLabel>{appPage.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}

          <IonMenuToggle autoHide={false}>
            <IonItem
              className={location.pathname === '/profile' ? 'selected' : ''}
              routerLink="/profile"
              routerDirection="none"
              lines="none"
              detail={false}
            >
              <IonIcon 
                aria-hidden="true" 
                slot="start" 
                ios={settingsOutline} 
                md={settingsSharp} 
              />
              <IonLabel>Profile Settings</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;