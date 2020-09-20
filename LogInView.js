import React, {useState, useEffect} from 'react';
import {View, SafeAreaView} from 'react-native';
import {Button, Text, Input} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import {useAuth} from './AuthProvider';
import firestore from '@react-native-firebase/firestore';
import {CheckBox, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/Feather';
import Geolocation from '@react-native-community/geolocation';

export function LogInView() {
  // Set an initializing state whilst Firebase connects
  const {logIn, createUser} = useAuth();
  const [authMode, setAuthMode] = useState('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shift, setShift] = useState('');
  const [certificates, setCertificates] = useState([]);
  const ToggleAuthModeComponent = ({authMode, setAuthMode}) => {
    if (authMode === 'Login') {
      return (
        <Button
          title="Haven't created an account yet? Register"
          type="outline"
          onPress={async () => {
            setAuthMode('Register');
          }}
        />
      );
    } else {
      return (
        <Button
          title="Have an account already? Login"
          type="outline"
          onPress={async () => {
            setAuthMode('Login');
          }}
        />
      );
    }
  };

  return (
    <>
      <Text h3>{authMode}</Text>
      <Input
        autoCapitalize="none"
        placeholder="email"
        onChangeText={setEmail}
      />
      <Input
        secureTextEntry={true}
        autoCapitalize="none"
        placeholder="password"
        onChangeText={setPassword}
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

      <Button title={'Get Location'} />

      <Button
        title={authMode}
        onPress={() => {
          if (authMode === 'Login') {
            logIn(email, password);
          } else {
            createUser(email, password);
          }
        }}
      />

      <ToggleAuthModeComponent setAuthMode={setAuthMode} authMode={authMode} />
    </>
  );
}
