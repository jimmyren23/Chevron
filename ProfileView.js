import {
  SafeAreaView,
  View,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
import firestore from '@react-native-firebase/firestore';
import Overlay from 'react-native-elements';

export function ProfileView() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [certifications, setCertifications] = useState([]); // Initial empty array of posts
  const [shift, setShift] = useState('');
  const [location, setLocation] = useState();
  const [name, setFirstName] = useState('');
  const {user} = useAuth();
  useEffect(() => {
    const subscriber = firestore()
      .collection('workers')
      .where('Email', '==', user.email)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          setCertifications(documentSnapshot.data().Certifications);
          setShift(documentSnapshot.data().Shift);
          setFirstName(documentSnapshot.id);
          setLocation(documentSnapshot.data().Location);
        });
        setLoading(false);
        console.log(certifications);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {user == null ? (
          <LogInView />
        ) : (
          <>
            <Text> Hello {name}! </Text>
            <Text> Your shift: {shift}! </Text>
            <Text>
              {' '}
              Your location: Latitude: {location.latitude}, Longitude:{' '}
              {location.longitude}!{' '}
            </Text>
            <FlatList
              data={certifications}
              keyExtractor={(item, index) => index}
              renderItem={({item}) => (
                <View
                  style={{
                    height: 50,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text> Certifications {item} </Text>
                </View>
              )}
            />
            <Footer />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
