import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {Button} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from './AuthProvider';

export function Footer() {
  const {logOut} = useAuth();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.bottomView}>
      <Button type="outline" title="Log Out" onPress={logOut} />
      <Button
        type="outline"
        title="Work Orders"
        onPress={() => navigation.navigate('Work Orders')}
      />
      <Button
        type="outline"
        title="My Profile"
        onPress={() => navigation.navigate('Profile')}
      />
      <Button
        type="outline"
        title="Create Work Order"
        onPress={() => navigation.navigate('Create Work Order')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },

  bottomView: {
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

  textStyle: {
    color: 'black',
    fontSize: 22,
  },
});
