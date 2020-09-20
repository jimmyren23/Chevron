import React, {useState, useEffect} from 'react';
import {View, SafeAreaView} from 'react-native';
import {Button, Text, Input} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import {useAuth} from './AuthProvider';
import firestore from '@react-native-firebase/firestore';
import {CheckBox, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Geolocation from '@react-native-community/geolocation';

export function LogInView() {
  // Set an initializing state whilst Firebase connects
  const {logIn, createUser} = useAuth();
  const [authMode, setAuthMode] = useState('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shift, setShift] = useState('Morning');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  function ToggleAuthModeComponent() {
    if (authMode === 'Login') {
      return (
        <Button
          style={magicStyles.container}
          title="Haven't created an account yet? Register"
          type="outline"
          onPress={() => {
            setAuthMode('Register');
          }}
        />
      );
    } else {
      return (
        <>
          <Button
            style={magicStyles.container}
            title="Have an account already? Login"
            type="outline"
            onPress={() => {
              setAuthMode('Login');
            }}
          />
        </>
      );
    }
  }

  return (
    <>
      <Text h3 style={magicStyles.topseg}>
        {authMode}
      </Text>
      <Input
        autoCapitalize="none"
        placeholder="email"
        onChangeText={(text) => setEmail(text)}
        style={magicStyles.input}
      />
      <Input
        secureTextEntry={true}
        autoCapitalize="none"
        placeholder="password"
        onChangeText={setPassword}
        style={magicStyles.input}
      />
      {authMode === 'Register' ? (
        <>
          <Input
            autoCapitalize="none"
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />
          <Input
            autoCapitalize="none"
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />
          <Input
            autoCapitalize="none"
            placeholder="Longitude"
            defaultValue={longitude}
            onChangeText={(text) => setLongitude(text)}
          />
          <Input
            autoCapitalize="none"
            placeholder="Latitude"
            defaultValue={latitude}
            onChangeText={(text) => setLatitude(text)}
          />
          <Button
            title={'Get Location'}
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
            items={[
              {label: 'Morning', value: 'Morning'},
              {label: 'Afternoon', value: 'Afternoon'},
              {label: 'Evening', value: 'Evening'},
            ]}
            defaultValue={'Morning'}
            containerStyle={{height: 40}}
            style={{backgroundColor: '#fafafa'}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            dropDownStyle={{backgroundColor: '#fafafa'}}
            onChangeItem={(item) => setShift(item.value)}
          />

          <DropDownPicker
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
            min={0}
            max={10}
            defaultValue={''}
            containerStyle={{height: 40}}
            itemStyle={{
              justifyContent: 'flex-start',
            }}
            onChangeItem={(item) => setCertificates(item)}
          />
          <Button
            title={authMode}
            style={magicStyles.container}
            onPress={() => {
              if (authMode === 'Login') {
                logIn(email, password);
              } else {
                if (
                  parseFloat(longitude) >= -180 &&
                  parseFloat(longitude) <= 180 &&
                  parseFloat(latitude) >= -90 &&
                  parseFloat(latitude) <= 90
                ) {
                  createUser(
                    email,
                    password,
                    shift,
                    firstName,
                    lastName,
                    certificates,
                    latitude,
                    longitude,
                  );
                } else {
                  console.log('not possible');
                }
              }
            }}
          />
        </>
      ) : (
        <>
          <Button
            title={authMode}
            style={magicStyles.container}
            onPress={() => {
              if (authMode === 'Login') {
                logIn(email, password);
              }
            }}
          />
        </>
      )}
      <ToggleAuthModeComponent setAuthMode={setAuthMode} authMode={authMode} />
    </>
  );
}
const magicStyles = StyleSheet.create({
  input: {
    margin:10,
    marginHorizontal: 40,
  },
  topseg: {
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginVertical: 20,
  },
  container: {
    margin:15,
    justifyContent: 'center',
    borderRadius: 150,
    overflow: 'hidden',
    borderColor: '#3381CA',
    borderWidth: 0.5,
  },
  location: {
    marginHorizontal: 140,
    marginBottom: 10,
    justifyContent: 'center',
    borderRadius: 500,
    overflow: 'hidden',
    borderColor: '#3381CA',
    borderWidth: 0.5,
    backgroundColor: '#3381CA',
  },
});
