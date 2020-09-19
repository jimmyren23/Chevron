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

const Stack = createStackNavigator();

function Posts() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [posts, setPosts] = useState([]); // Initial empty array of posts

  useEffect(() => {
  const subscriber = firestore()
    .collection('Posts')
    .orderBy('Date', 'desc')
    .onSnapshot(querySnapshot => {
      const posts = [];

      querySnapshot.forEach(documentSnapshot => {
        posts.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });

      setPosts(posts);
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
      data={posts}
      renderItem={({ item }) => (
        <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {item.Title}</Text>
          <Text>Description: {item.Description}</Text>
          <Text>Posted By: {item.User}</Text>
        </View>
      )}
    />
  );

}

function MyPosts() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [posts, setPosts] = useState([]); // Initial empty array of posts
  const { user } = useAuth();
  useEffect(() => {
  const subscriber = firestore()
    .collection('Posts')
    .where('User', '==', user.email)
    .onSnapshot(querySnapshot => {
      const posts = [];

      querySnapshot.forEach(documentSnapshot => {
        posts.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });

      setPosts(posts);
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
      data={posts}
      renderItem={({ item }) => (
        <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Title: {item.Title}</Text>
          <Text>Description: {item.Description}</Text>
          <Text>Posted By: {item.User}</Text>
        </View>
      )}
    />
  );

}
const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Feed"
        screenOptions = {{ headerLeft: null, animationEnabled: false,  headerShown: false}}>
          <Stack.Screen name="Work Orders" component={WorkOrderView}/>
          <Stack.Screen name="Create Post" component={CreatePostView} />
          <Stack.Screen name="Home" component={HomeView} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};


function WorkOrderView({ navigation }) {
  const { user, logOut } = useAuth();
  const usersCollection = firestore().collection('Users');
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          {user == null ? (
            <LogInView/>
          ) : (
            <>
              <Text> hi {user.email} </Text>
              <Posts/>
              <Footer/>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

//Separate page to add new post
function CreatePostView({ navigation }) {
  const {user} = useAuth();
  const [newPostName, setNewPostName] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          {user == null ? (
            <LogInView />
          ) : (
            <>
              <AddPostView/>
              <Footer/>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}


function HomeView({ navigation }) {
  const { user } = useAuth();
  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          {user == null ? (
            <LogInView />
          ) : (
            <>
              <Text> Welcome!</Text>
              <MyPosts/>
              <Footer/>
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
export default App;
