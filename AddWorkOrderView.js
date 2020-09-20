import React, {useState, useRef} from 'react';
import {Overlay, Input, Button} from 'react-native-elements';
import {Text, TextInput, View, SafeAreaView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import {LogInView} from './LogInView';
import {useAuth} from './AuthProvider';
import {Footer} from './navigationBar';
// The AddWorkOrderView is a button for adding Work Orders. When the button is pressed, an
// overlay shows up to request user input for the new Work Order name. When the
// "Create" button on the overlay is pressed, the overlay closes and the new
// Work Order is created in the realm.
export function AddWorkOrderView() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [eqID, setEqID] = useState('');
  const [eqType, setEqType] = useState('Compressor');
  const [facility, setFacility] = useState('Fac1');
  const [priority, setPriority] = useState('');
  const [timeComp, setTimeComp] = useState('');
  const {user, logOut} = useAuth();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1}}>
        {user == null ? (
          <LogInView />
        ) : (
          <>
            <Text h1 style={magicStyles.topseg}>
              Place Work Order
            </Text>
            <DropDownPicker
              items={[
                {label: 'Facility 1', value: 'Fac1'},
                {label: 'Facility 2', value: 'Fac2'},
                {label: 'Facility 3', value: 'Fac3'},
                {label: 'Facility 4', value: 'Fac4'},
                {label: 'Facility 5', value: 'Fac5'},
              ]}
              defaultValue={'Fac1'}
              containerStyle={{height: 40}}
              style={magicStyles.drop}
              itemStyle={{
                justifyContent: 'flex-start',
              }}
              dropDownStyle={magicStyles.dropper}
              onChangeItem={(item) => setFacility(item.value)}
            />
            <Input
              placeholder="Priority(1-5)"
              onChangeText={(text) => setPriority(text)}
              autoFocus={true}
              value={priority}
              style={magicStyles.input2}
            />
            <Input
              placeholder="Time to Complete"
              onChangeText={(text) => setTimeComp(text)}
              autoFocus={true}
              value={timeComp}
              style={magicStyles.input1}
            />
            <DropDownPicker
              items={[
                {label: 'Compressor', value: 'Compressor'},
                {label: 'Conveyor', value: 'Conveyor'},
                {label: 'Electricity', value: 'Electricity'},
                {label: 'HVAC', value: 'HVAC'},
                {label: 'Networking', value: 'Networking'},
                {label: 'Pump', value: 'Pump'},
                {label: 'Security', value: 'Security'},
                {label: 'Sensor', value: 'Sensor'},
                {label: 'Seperator', value: 'Seperator'},
                {label: 'Vehicle', value: 'Vehicle'},
              ]}
              defaultValue={'Compressor'}
              containerStyle={{height: 40}}
              style={magicStyles.drop}
              itemStyle={{
                justifyContent: 'flex-start',
              }}
              dropDownStyle={magicStyles.dropper}
              onChangeItem={(item) => setEqType(item.value)}
            />
            <Input
              style={magicStyles.input2}
              placeholder="Equipment ID"
              onChangeText={(text) => setEqID(text)}
              autoFocus={true}
              value={eqID}
            />
            
            <Button
              style={magicStyles.container}
              title="Create"
              onPress={() => {
                if (priority >= 1 && priority <= 5) {
                  var date = new Date().getDate(); //To get the Current Date
                  var month = new Date().getMonth() + 1; //To get the Current Month
                  var year = new Date().getFullYear(); //To get the Current Year
                  var hours = new Date().getHours(); //To get the Current Hours
                  var min = new Date().getMinutes(); //To get the Current Minutes
                  setOverlayVisible(false);
                  firestore()
                    .collection('work order')
                    .add({
                      'Equipment ID': eqID,
                      'Equipment Type': eqType,
                      'Facility Number': facility,
                      Priority: priority,
                      'Time to Complete': timeComp,
                      TimeStamp:
                        month +
                        '/' +
                        date +
                        '/' +
                        year +
                        ' ' +
                        hours +
                        ':' +
                        min,
                    })
                    .then(() => {
                      console.log('New Work Order added!');
                    });
                  navigation.navigate('Work Orders');
                } else {
                  console.log('wrong priority');
                }
              }}
            />
            <Footer />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const magicStyles = StyleSheet.create({
  input: {
    margin:-5,
    marginHorizontal: 7,
  },
  input2: {
    marginTop:15,
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
    marginTop:10,
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
  dropper:{
    backgroundColor: '#fafafa',
  }
});
