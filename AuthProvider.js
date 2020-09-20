import React, {useContext, useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AuthContext = React.createContext(null);

// The AuthProvider is responsible for user management and provides the
// AuthContext value to its descendants. Components under an AuthProvider can
// use the useAuth() hook to access the auth value.
const AuthProvider = ({children}) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // The log in function takes an email and password and uses the emailPassword
  // authentication provider to log in.
  const logIn = async (email, password) => {
    await auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
      });
  };

  // The register function takes an email and password and uses the emailPassword
  // authentication provider to register the user.
  const createUser = async (
    email,
    password,
    shift,
    firstName,
    lastName,
    certificates,
    latitude,
    longitude,
  ) => {
    await auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
        firestore()
          .collection('workers')
          .doc(firstName)
          .set({
            Certifications: certificates,
            Location: new firestore.GeoPoint(
              parseFloat(latitude),
              parseFloat(longitude),
            ),
            Shift: shift,
            Email: email,
          })
          .then(() => {
            console.log('User added to the collection!');
          });
      });
  };

  // Log out the current user.
  const logOut = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        createUser,
        user,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// The useAuth hook can be used by components under an AuthProvider to access
// the auth context value.
const useAuth = () => {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error('useAuth() called outside of a AuthProvider?');
  }
  return auth;
};

export {AuthProvider, useAuth};
