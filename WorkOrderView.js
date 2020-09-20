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
import {Overlay} from 'react-native-elements';

function WorkOrders() {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [orders, setOrders] = useState([]); // Initial empty array of posts
  const [visible, setVisible] = useState(false); // Visibility of Overlay
  // adjust overlay
  const toggleOverlay = () => {
    setVisible(!visible);
  };
  //adjust text
  const [textdesc, setText] = useState('unknown');
  function updateText(item) {
    setText(item['Equipment ID']);
  }
  useEffect(() => {
    const subscriber = firestore()
      .collection('schedule')
      .orderBy('Time', 'asc')
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
    <>
      <Text h1 style={magicStyles.topseg}>
        View My Schedule
      </Text>
      <View style={surajStyles.views}>
        <FlatList
          data={orders}
          contentContainerStyle={{paddingBottom: 100}}
          renderItem={({item}) => (
            <View elevation={9} style={surajStyles.container}>
              <Text>Time: {item.Time} </Text>
              <Text>
                {' '}
                Repair {item['Equipment Type']} at {item.Facility}{' '}
              </Text>
              <Button
                title="Show Details ->"
                onPress={() => {
                  toggleOverlay();
                  updateText(item);
                }}
              />
              <Overlay
                overlayStyle={{
                  backgroundColor: 'lightblue',
                  borderRadius: 50,
                  borderColor: 'black',
                  borderWidth: 1.5,
                }}
                isVisible={visible}
                onBackdropPress={toggleOverlay}>
                <View
                  style={{
                    backgroundColor: 'lightblue',
                    margin: 10,
                    height: 200,
                    width: 200,
                  }}>
                  <Text style={surajStyles.texter}>
                    You've been assigned to repair Equipment ID: {textdesc}{' '}
                  </Text>
                  <Text> </Text>
                  <Text style={surajStyles.texter}>
                    Please complete task at the scheduled time{' '}
                  </Text>
                  <Text> </Text>
                  <Text> </Text>
                  <Text style={surajStyles.texterBold}>
                    Click anywhere to exit{' '}
                  </Text>
                </View>
              </Overlay>
            </View>
          )}
        />
      </View>
    </>
  );
}

export function WorkOrderView() {
  const {user, logOut} = useAuth();
  return (
    <SafeAreaView style={{flex: 1}}>
      {user == null ? (
        <LogInView />
      ) : (
        <>
          <WorkOrders />
          <Footer style={surajStyles.footer} />
        </>
      )}
    </SafeAreaView>
  );
}
const surajStyles = StyleSheet.create({
  footer: {
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
  container: {
    height: 120,
    flex: 1,
    marginTop: 25,
    marginHorizontal: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'lightblue',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 3,
    color: 'white',
  },
  views: {
    flex: 1,
  },

  texter: {
    fontSize: 20,
    textAlign: 'center',
    justifyContent: 'center',
  },
  texterBold: {
    fontStyle: 'italic',
    fontSize: 20,
    textAlign: 'center',
    justifyContent: 'center',
  },
});

const magicStyles = StyleSheet.create({
  input: {
    margin: -5,
    marginHorizontal: 7,
  },
  input2: {
    marginTop: 15,
    marginHorizontal: 7,
  },
  topseg: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 20,
    fontSize: 30,
  },
  container: {
    marginHorizontal: 15,
    marginTop: 10,
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
  dropper: {
    backgroundColor: '#fafafa',
  },
});
