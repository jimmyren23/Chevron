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
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        style={magicStyles.input}
      />
      <Input
        secureTextEntry={true}
        autoCapitalize="none"
        placeholder="Password"
        onChangeText={setPassword}
        style={magicStyles.input}
      />
      {authMode === 'Register' ? (
        <>
          <Text h4 style={magicStyles.topseg}>
            Worker Information
          </Text>
          <Input
            autoCapitalize="none"
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
            style={magicStyles.input}
          />
          <Input
            autoCapitalize="none"
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
            style={magicStyles.input}
          />
          <DropDownPicker
            style={magicStyles.drop}
            items={[
              {label: 'Morning', value: 'Morning'},
              {label: 'Evening', value: 'Evening'},
            ]}
            placeholder={'Select a Shift'}
            containerStyle={{height: 40}}
            itemStyle={{justifyContent: 'flex-start' }}
            dropDownStyle={magicStyles.dropper}
            onChangeItem={(item) => setShift(item.value)}
          />
          <Input
            autoCapitalize="none"
            placeholder="Longitude"
            defaultValue={longitude}
            onChangeText={(text) => setLongitude(text)}
            style={magicStyles.input2}
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
            dropDownStyle={magicStyles.dropper}
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
    margin:-5,
    marginHorizontal: 7,
  },
  input2: {
    marginTop:15,
    marginHorizontal: 7,
  },
  topseg: {
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginVertical: 20,
  },
  container: {
    marginHorizontal: 15,
    marginTop:10,
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
  dropper:{
    backgroundColor: '#fafafa',
  }
});
