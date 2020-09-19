import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StatusBar,SafeAreaView, ActivityIndicator, FlatList} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation} from '@react-navigation/native';
import {AuthProvider} from './AuthProvider'
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
import {AddPostView} from './AddPostView';
import firestore from '@react-native-firebase/firestore';

export function Friends() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [following, setFollowing] = useState([]); // Initial empty array of posts
  const [followers, setFollowers] = useState([]); // Initial empty array of posts
  const {user} = useAuth();

// Gets the number of users that follow you/ who follows you
  useEffect(() => {
  const subscriber = firestore()
    .collection('Users')
    .onSnapshot(querySnapshot => {
      const followers = [];
      querySnapshot.forEach(documentSnapshot => {
        if(documentSnapshot.data().Following.includes(user.email)){
          followers.push(
            documentSnapshot.data().email
          );
        }
      });
      setFollowers(followers);
      setLoading(false);
    });
  // Unsubscribe from events when no longer in use
  return () => subscriber();
  }, []);

// Gets the number of following/ who you are following
  useEffect(() => {
  const subscriber = firestore()
    .collection('Users')
    .doc(user.email)
    .onSnapshot(documentSnapshot => {
       setFollowing(documentSnapshot.data().Following);
       setLoading(false);
     });
  // Unsubscribe from events when no longer in use
  return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }



  return (
    <View>
      <>
        <Text> Number of users you follow: {following.length} </Text>
        <Text> Number of users that follow you: {followers.length} </Text>
        <FlatList
          data={following}
          keyExtractor={(item, index) => item.key}
          renderItem={({ item }) => (
            <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text> Following: {item }</Text>
            </View>
          )}
        />
        <FlatList
          data={followers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text> Followers: {item }</Text>
            </View>
          )}
        />

      </>
    </View>
  );
}
