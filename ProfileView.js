import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import {Button} from 'react-native-elements';
import React, {useState, useEffect} from 'react';
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

export function ProfileView() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [certifications, setCertifications] = useState([]); // Initial empty array of posts
  const [shift, setShift] = useState('');
  const [location, setLocation] = useState();
  const [name, setFirstName] = useState('');
  const {user} = useAuth();
  const navigation = useNavigation();
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
      {user == null ? (
        <LogInView />
      ) : (
        <>
          <Text h1 style={magicStyles.topseg}>
            {' '}
            Hello {name}!{' '}
          </Text>
          <Text style={magicStyles.topseg}> Your chosen shifts: {shift} </Text>
          <Text style={magicStyles.topseg}>
            {' '}
            Your location (Latitude, Longitude): ({location.latitude},{' '}
            {location.longitude})
          </Text>
          <Text h1 style={magicStyles.topseg}>
            Certifications:
          </Text>
          <View>
            <FlatList
              data={certifications}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <View
                  style={{
                    height: 50,
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text> {item} </Text>
                </View>
              )}
            />
          </View>
          <Button
            style={magicStyles.container}
            title="Edit Profile"
            onPress={() => navigation.navigate('Edit Profile')}
          />
          <Footer style={surajStyles.footer} />
        </>
      )}
    </SafeAreaView>
  );
}
const surajStyles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    padding: 10,
  },
  button: {
    backgroundColor: 'black',
  },
  container: {
    height: 120,
    flex: 1,
    marginTop: 25,
    marginHorizontal: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'lightblue',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 3,
    color: 'white',
  },
  views: {
    flex: 1,
  },

  texter: {
    fontSize: 20,
    textAlign: 'center',
    justifyContent: 'center',
  },
});

const magicStyles = StyleSheet.create({
  input: {
    margin: -5,
    marginHorizontal: 7,
  },
  input2: {
    marginTop: 15,
    marginHorizontal: 7,
  },
  topseg: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 20,
    fontSize: 30,
  },
  container: {
    marginHorizontal: 15,
    marginTop: 10,
    justifyContent: 'center',
    borderRadius: 150,
    overflow: 'hidden',
    borderColor: '#3381CA',
    borderWidth: 0.5,
  },
  location: {
    marginHorizontal: 110,
    marginBottom: 10,
    justifyContent: 'center',
    borderRadius: 500,
    overflow: 'hidden',
    borderColor: '#3381CA',
    borderWidth: 0.5,
    backgroundColor: '#3381CA',
  },

  drop: {
    marginVertical: 1,
    marginHorizontal: 6,
  },
  dropper: {
    backgroundColor: '#fafafa',
  },
});
