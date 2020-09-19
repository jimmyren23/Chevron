import {SafeAreaView, View, StatusBar, Text, TextInput, Button} from 'react-native';
import React from 'react';
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';

export function WorkOrderView() {
  const { user, logOut } = useAuth();
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {user == null ? (
          <LogInView/>
        ) : (
          <>
            <Text> hi {user.email} </Text>
            <Button title="Log Out" onPress={() => logOut()}/>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
