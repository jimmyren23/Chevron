import {
  SafeAreaView,
  View,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from '@react-native-community/geolocation';
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
import firestore from '@react-native-firebase/firestore';
import {Button, Text, Input, Overlay} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';

export function EditProfileView() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [certificates, setCertifications] = useState([]);
  const [name, setFirstName] = useState('');
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [shift, setShift] = useState('Morning');
  const [error, setError] = useState();
  const {user} = useAuth();
  const navigation = useNavigation();
  useEffect(() => {
    const subscriber = firestore()
      .collection('workers')
      .where('Email', '==', user.email)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          setFirstName(documentSnapshot.id);
        });
        setLoading(false);
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
            <Text h1 style={magicStyles.topseg}>
              {' '}
              Edit Profile{' '}
            </Text>
            <DropDownPicker
              style={magicStyles.drop}
              items={[
                {label: 'Morning', value: 'Morning'},
                {label: 'Evening', value: 'Evening'},
              ]}
              placeholder={'Select a Shift'}
              containerStyle={{height: 40}}
              itemStyle={{justifyContent: 'flex-start'}}
              dropDownStyle={{backgroundColor: '#fafafa'}}
              onChangeItem={(item) => setShift(item.value)}
            />
            <Input
              autoCapitalize="none"
              placeholder="Longitude"
              defaultValue={longitude}
              onChangeText={(text) => setLongitude(text)}
              style={magicStyles.input}
            />
            <Input
              autoCapitalize="none"
              placeholder="Latitude"
              defaultValue={latitude}
              onChangeText={(text) => setLatitude(text)}
              style={magicStyles.input}
            />
            <Button
              title={'Find My Location'}
              buttonStyle={magicStyles.location}
              onPress={() => {
                Geolocation.requestAuthorization();
                Geolocation.getCurrentPosition(
                  (position) => {
                    setLongitude(JSON.stringify(position.coords.longitude));
                    //getting the Longitude from the location json
                    setLatitude(JSON.stringify(position.coords.latitude));
                  },
                  (error) => {
                    console.log('map error: ', error);
                    console.log(error.code, error.message);
                  },
                  {enableHighAccuracy: false, timeout: 15000, maximumAge: 500},
                );
              }}
            />

            <DropDownPicker
              style={magicStyles.drop}
              items={[
                {label: 'Conveyor', value: 'Conveyor'},
                {label: 'Seperator', value: 'Seperator'},
                {label: 'Compressor', value: 'Compressor'},
                {label: 'Electricity', value: 'Electricity'},
                {label: 'Sensor', value: 'Sensor'},
                {label: 'Security', value: 'Security'},
                {label: 'Networking', value: 'Networking'},
                {label: 'Vehicle', value: 'Vehicle'},
                {label: 'Pump', value: 'Pump'},
                {label: 'HVAC', value: 'HVAC'},
              ]}
              multiple={true}
              multipleText="%d items have been selected."
              placeholder={'Select your Certifications'}
              min={0}
              max={10}
              containerStyle={{height: 40}}
              itemStyle={{
                justifyContent: 'flex-start',
              }}
              onChangeItem={(item) => setCertifications(item)}
            />
            <Button
              title="Submit Changes"
              style={magicStyles.container}
              onPress={() => {
                if (
                  parseFloat(longitude) >= -180 &&
                  parseFloat(longitude) <= 180 &&
                  parseFloat(latitude) >= -90 &&
                  parseFloat(latitude) <= 90
                ) {
                  setError(null);
                  navigation.navigate('Profile');
                  firestore()
                    .collection('workers')
                    .doc(name)
                    .update({
                      Certifications: certificates,
                      Location: new firestore.GeoPoint(
                        parseFloat(latitude),
                        parseFloat(longitude),
                      ),
                      Shift: shift,
                    })
                    .then(() => {
                      console.log('User updated!');
                    });
                } else {
                  console.log('no');
                  setError('This position is not possible!');
                }
              }}
            />
            <Text style={magicStyles.error}>{error}</Text>
          </>
        )}
      </View>
      <Footer />
    </SafeAreaView>
  );
}
const magicStyles = StyleSheet.create({
  input: {
    margin: -5,
    marginHorizontal: 7,
  },
  error: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 20,
    fontStyle: 'italic',
    color: 'red',
  },
  topseg: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 20,
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
    marginHorizontal: 30,
  },
  dropper: {
    backgroundColor: '#fafafa',
  },
});
