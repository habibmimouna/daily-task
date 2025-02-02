import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import TaskPage from './pages/TaskPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import { useEffect } from 'react';

setupIonicReact();

const setupStatusBar = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
    await StatusBar.setOverlaysWebView({ overlay: true }); // Add this line
  } catch (err) {
    console.warn('Cannot set status bar', err);
  }
};

setupStatusBar();

const PrivateRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      render={props => {
        return currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        );
      }}
    />
  );
};

const PublicRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      render={props => {
        return !currentUser ? (
          <Component {...props} />
        ) : (
          <Redirect to="/category/Work" />
        );
      }}
    />
  );
};

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <IonApp>
      <IonReactRouter>
        {currentUser ? (
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main">
              <PrivateRoute path="/category/:category" component={TaskPage} exact />
              <PrivateRoute path="/profile" component={ProfilePage} exact />
              <Route path="/" exact>
                <Redirect to="/category/Work" />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        ) : (
          <IonRouterOutlet>
            <PublicRoute path="/login" component={LoginPage} exact />
            <PublicRoute path="/register" component={RegisterPage} exact />
            <Route path="/" exact>
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    SplashScreen.show({
      showDuration: 2000,
      autoHide: true,
    });
  }, []);


  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};


export default App;