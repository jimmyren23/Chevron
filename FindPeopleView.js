import React, { useState, useEffect } from 'react';
import { View, TextInput, StatusBar,SafeAreaView, ActivityIndicator, FlatList} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation} from '@react-navigation/native';
import {AuthProvider} from './AuthProvider'
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
import {AddPostView} from './AddPostView';
import firestore from '@react-native-firebase/firestore';
import {Overlay, Input, Button, Text} from 'react-native-elements';



export function FindPeopleView() {
  const [search, setSearch] = useState('');
  const [people, setPeople] = useState([]); // Initial empty array of posts
  const [following, setFollowing] = useState([]); // Initial empty array of posts
  const {user} = useAuth();

  // Refreshes the query, sets the people that have the email
  function searchRefresh(text) {
    setSearch(text);
    firestore()
    .collection('Users')
    .where('email', '==', text)
    .onSnapshot(querySnapshot => {
      const people = [];
      querySnapshot.forEach(documentSnapshot => {
        people.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
        console.log("Searching for:" + text);
      });
    });
  }

  // Follows the user found
  function addFollowing(email) {
      firestore()
      .collection('Users')
      .doc(user.email)
      .update({
        Following: firestore.FieldValue.arrayUnion(email),
      })
      console.log("Added:" + email);
  }

  // Follows the user found
  function removeFollowing(email) {
    firestore()
    .collection('Users')
    .doc(user.email)
    .update({
      Following: firestore.FieldValue.arrayRemove(email),
    })
    console.log("Remove Following:" + following);
  }

  // Gets people that match search, sets it to the people that match
  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .where('email', '==', search)
      .onSnapshot(querySnapshot => {
        const people = [];
        querySnapshot.forEach(documentSnapshot => {
          people.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setPeople(people);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, [people]);

  // Gets the following list
  useEffect(() => {
      const subscriber = firestore()
        .collection('Users')
        .doc(user.email)
        .onSnapshot(documentSnapshot => {
           setFollowing(documentSnapshot.data().Following);
           console.log("Updated Following List:" + following);
         });
  // Unsubscribe from events when no longer in use
  return () => subscriber();
}, [following]);



  return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
        {user == null ? (
          <LogInView />
        ) : (
            <>
              <Input
                placeholder="Search by Email"
                onChangeText={(text) => searchRefresh(text)}
                autoFocus={true}
                autoCapitalize = 'none'
              />
              <Text h3> Your Search </Text>
              {people.length > 0 ?
              <FlatList
                data={people}
                extraData={people}
                keyExtractor={(item, index) => item.key}
                renderItem={({ item }) => (
                  <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text> {item.email}</Text>
                    {following.includes(item.email) ? <Button title='Friends' onPress={() => removeFollowing(item.email)}/> :
                      <Button title="Add new Friend" onPress={() => addFollowing(item.email)}/>}
                      </View>
                )}
              /> : <Text> No Results</Text>}
              <Footer/>
            </>
            )}
        </View>
      </SafeAreaView>
  );
}
