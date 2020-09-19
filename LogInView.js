import React, { useState, useEffect } from 'react';
import { View, SafeAreaView} from 'react-native';
import {Button, Text, Input} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import {useAuth} from './AuthProvider';
import firestore from '@react-native-firebase/firestore';

export function LogInView() {
    // Set an initializing state whilst Firebase connects
  const {logIn, createUser} = useAuth();
  const [authMode, setAuthMode] = useState('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <Button title={authMode}
          onPress={() => {
            if (authMode === 'Login') {
                logIn(email, password);
              } else {
                createUser(email, password);
              }
            }}/>
        <ToggleAuthModeComponent setAuthMode={setAuthMode} authMode={authMode} />
    </>
  );

}
