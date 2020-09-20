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

function WorkOrders() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [orders, setOrders] = useState([]); // Initial empty array of posts

  useEffect(() => {
    const subscriber = firestore()
      .collection('sample work order')
      .orderBy('Submission Timestamp', 'desc')
      .onSnapshot((querySnapshot) => {
        const orders = [];
        querySnapshot.forEach((documentSnapshot) => {
          orders.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });

        setOrders(orders);
        setLoading(false);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={orders}
      renderItem={({item}) => (
        <View
          style={{
            height: 50,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text>Title: {item.Facility}</Text>
        </View>
      )}
    />
  );
}

export function WorkOrderView() {
  const {user, logOut} = useAuth();
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {user == null ? (
          <LogInView />
        ) : (
          <>
            <Text> hellow sir {user.email} </Text>
            <WorkOrders />
            <Footer />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const surajStyles = StyleSheet.create({
  container: {
    height: 80,
    flex: 1,
    marginTop: 10,
    marginHorizontal: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor:"lightblue",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 3,
  },
});
