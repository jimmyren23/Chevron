import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './AuthProvider';
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
import {ProfileView} from './ProfileView';
import {AddWorkOrderView} from './AddWorkOrderView';
import {WorkOrderView} from './WorkOrderView';
import {EditProfileView} from './EditProfile';
import firestore from '@react-native-firebase/firestore';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Feed"
          screenOptions={{
            headerLeft: null,
            animationEnabled: false,
            headerShown: false,
          }}>
          <Stack.Screen name="Work Orders" component={WorkOrderView} />
          <Stack.Screen name="Create Work Order" component={AddWorkOrderView} />
          <Stack.Screen name="Profile" component={ProfileView} />
          <Stack.Screen name="Edit Profile" component={EditProfileView} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
