import firestore from '@react-native-firebase/firestore';

class Worker {
  constructor(name, certifications, shift, location) {
    this.name = name;
    this.certifications = certifications;
    this.shift = shift;
    this.location = location;
    this.currentPosition = location;
    this.timeLeftinShift = 8;
    this.schedule = [];
    this.doneScheduling = false;
  }
}

class WorkOrder {
  constructor(
    eID,
    eType,
    facility,
    location,
    priority,
    timeStamp,
    timeToComplete,
  ) {
    this.eID = eID;
    this.eType = eType;
    this.facility = facility;
    this.location = location;
    this.priority = priority;
    this.timeStamp = timeStamp;
    this.timeToComplete = timeToComplete;
    this.done = false;
  }
}

class Facility {
  constructor(name, location, maxOcc) {
    this.name = name;
    this.location = location;
    this.maxOcc = maxOcc;
    this.curOcc = 0;
  }
}
//assigns a worker
export function assignWorker() {
  var tempWorkers = [];
  async function workers() {
    const workersCollection = await firestore()
      .collection('workers')
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.forEach(async (documentSnapshot) => {
          let temp = new Worker(
            documentSnapshot.id,
            documentSnapshot.data().Certifications,
            documentSnapshot.data().Shift,
            [
              documentSnapshot.data().Location.longitude,
              documentSnapshot.data().Location.latitude,
            ],
          );
          tempWorkers.push(temp);
        });
      });
    return tempWorkers;
  }

  var tempFacilities = [];
  async function Facilities() {
    var tempFacilities = [];
    const facilitiesCollection = await firestore()
      .collection('facility')
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.forEach(async (documentSnapshot) => {
          let temp = new Facility(
            documentSnapshot.id,
            [
              documentSnapshot.data().Location.longitude,
              documentSnapshot.data().Location.latitude,
            ],
            documentSnapshot.data()['Max Occupancy'],
          );
          tempFacilities.push(temp);
        });
      });
    return tempFacilities;
  }

  var tempWorkOrders = [];
  async function workOrders() {
    var tempWorkOrders = [];
    const workOrdersCollection = await firestore()
      .collection('sample work order')
      .get()
      .then(async (querySnapshot) => {
        querySnapshot.forEach(async (documentSnapshot) => {
          let temp = new WorkOrder(
            documentSnapshot.data()['Equipment ID'],
            documentSnapshot.data()['Equipment Type'],
            documentSnapshot.data().Facility,
            getFCoord(documentSnapshot.data().Facility, tempFacilities),
            documentSnapshot.data()['Priority(1-5)'],
            documentSnapshot.data()['Submission Timestamp'],
            documentSnapshot.data()['Time to Complete'],
          );
          tempWorkOrders.push(temp);
        });
      });
    return tempWorkOrders;
  }

  // final part
  console.log('Reached Assigned Schedule');
  workOrders().then((y) => {
    workers().then((z) => {
      assignSchedule(z, y);
      for (let i = 0; i < z.length; ++i) {
        firestore()
          .collection('schedules')
          .doc(tempWorkers[i].name)
          .set({
            schedule: tempWorkers[i].schedule,
          })
          .then(() => {});
      }
    });
  });
  console.log('Reached Assigned Schedule');
  function getFCoord(inFacility) {
    Facilities().then((x) => {
      for (let i = 0; i < x.length; ++i) {
        if (inFacility === x[i].name) {
          // //console.log(
          // //  'fCoord lat: ',
          // //  x[i].location[0],
          // //  ', fCoord long: ',
          //   x[i].location[1],
          // );
          return [x[i].location[0], x[i].location[1]];
        }
      }
    });
  }

  // if a task is completed, we remove the work order
  // if a task isn't completed by shift end, we subtract the time spent on the task and change the work order to reflect that

  // two points (long, lat) distance function

  function distBetweenTwoGeoPoints(lat, long, lat2, long2) {
    const earthRadius = 6371;
    let deltaPhi = ((lat2 - lat) * Math.PI) / 180;
    let deltaLambda = ((long2 - long) * Math.PI) / 180;
    let phi1 = (lat * Math.PI) / 180;
    let phi2 = (lat2 * Math.PI) / 180;

    let a =
      Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    let c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  // initial schedule for the day will come from all work orders that haven't been completed before their shift

  //based upon technician certification we'd filter the work orders applicable

  // letiables for optimization
  // probability of failure
  // location distance
  // priority

  // function -> ()

  //filter each task by worker which can complete them
  //for each worker, filter tasks that they can complete

  // urgency score will be function of priority and time since task has been requested

  // real time will be time takes to complete + travel time

  // multiplier will be a function of how long a task will take and how much time is left in that person's shift

  function score(workorder) {
    //return workorder.priority * timeSinceRequest(workorder.timeStamp);
    return workorder.priority;
  }

  function listOfTasksPerWorker() {
    workOrders().then((Workers) => {
      workers().then((workorders) => {
        let numWorkers = Workers.length;
        let numTasks = workorders.length;
        let possibleTasks = [];
        for (let i = 0; i < numWorkers; ++i) {
          let taskList = [];
          for (let j = 0; j < numTasks; ++j) {
            //console.log("equipment " + workorders[j].eType);
            for (let k = 0; k < workers[i].certifications.length; ++k) {
              //console.log("certif " + workers[i].certifications[k]);
              if (workorders[j].eType === workers[i].certifications[k]) {
                //check certifications
                taskList.push(workorders[j]);
              }
            }
          }
          possibleTasks.push(taskList);
        }
        return possibleTasks;
      });
    });
  }

  //given task will be apart of taskList
  function removeTask(task, taskList) {
    let newArr = [];
    for (let i = 0; i < taskList.length; ++i) {
      if (task.eID === taskList[i].eID) {
        newArr = taskList.slice(i, i + 1);
        return newArr;
      }
    }
  }

  // while workers have shift
  // go through workorders
  // terminates either when all the workers shifts are full or when there are no work orders
  function assignSchedule() {
    workOrders().then((Workers) => {
      workers().then((workorders) => {
        let numDone = 0;
        while (numDone < Workers.length && workorders.length > 0) {
          console.log('before choose workers');
          chooseWorkers(Workers, workorders);
          console.log('pass choose workers');
          for (let i = 0; i < Workers.length; ++i) {
            if (Workers[i].timeLeftinShift <= 0) {
              ++numDone;
            }
          }
        }
      });
    });
  }

  //change time left in workshift
  //change location of worker
  //say task is assigned, and remove from workorder IF COMPLETED
  function assignTask(worker, workorder) {
    workOrders().then((workorders) => {
      let taskTime =
        workorder.timeToComplete +
        timeToGetFacility(worker.location, workorder.location);
      if (worker.timeLeftinShift < taskTime) {
        worker.timeLeftinShift = 0;
        workorder.timeToComplete =
          worker.timeToComplete - worker.timeLeftinShift;
      } else {
        worker.timeLeftinShift = worker.timeLeftinShift - taskTime;
        workorder.timeToComplete = 0;
        workorders = removeTask(workorder, workorders);
      }
      worker.location = workorder.location;
      worker.schedule.push(workorder);
      console.log('assign task');
    });
  }

  function chooseWorkers() {
    workOrders().then((Workers) => {
      workers().then((workorders) => {
        for (let i = 0; i < Workers.length; ++i) {
          let keep = true;
          let bestTaskw1;
          let bestTaskw2;
          let worker1Tasks = listOfTasksPerWorker(Workers, workorders)[i];
          console.log('tasks: ', worker1Tasks);
          let schedule = oneSchedule(Workers[i], worker1Tasks);
          if (!schedule[0].length) {
            break;
          } else {
            bestTaskw1 = schedule[0][0];
          }
          console.log('pass schedule');
          if (!Workers[i].doneScheduling) {
            for (let j = i + 1; j < Workers.length; ++j) {
              if (!Workers[j].doneScheduling) {
                let worker2Tasks = listOfTasksPerWorker(Workers, workorders)[j];

                let schedule2 = oneSchedule(Workers[j], worker2Tasks);
                if (!schedule2[0].length) {
                  break;
                } else {
                  bestTaskw2 = schedule[0][0];
                  if (bestTaskw1.eID === bestTaskw2.eID) {
                    let w1SecondSchedule = oneSchedule(
                      Workers[i],
                      removeTask(bestTaskw1, worker1Tasks),
                    );
                    let w2SecondSchedule = oneSchedule(
                      Workers[j],
                      removeTask(bestTaskw1, worker1Tasks),
                    );

                    if (
                      bestTaskw1[1] - w1SecondSchedule[1] <
                      bestTaskw2[1] - w2SecondSchedule[1]
                    ) {
                      keep = false;
                      i = i - 1;
                      //fix next line
                      worker1Tasks = removeTask(bestTaskw1, worker1Tasks);
                      break;
                    }
                  }
                }
              }
            }
            if (keep) {
              assignTask(Workers[i], bestTaskw1, workorders);
            }
          }
        }
      });
    });
  }

  function timeToGetFacility(point1, point2) {
    const avgSpdKm = 70;

    let timeToGetThere =
      distBetweenTwoGeoPoints(point1[0], point1[1], point2[0], point2[1]) /
      avgSpdKm;

    return timeToGetThere;
  }

  function oneSchedule(worker1, worker1Tasks) {
    let time1 = worker1.timeLeftinShift;
    let total1 = 0;
    let tasks1 = [];

    let tempLocation = worker1.location;
    while (time1 > 0) {
      let bestOrder;
      let bestOrderInd;
      let bestScorePerHour = 0;
      let travelTime = 0;
      let bestTravelTime = 0;
      console.log('before for');
      console.log(worker1Tasks.length.toString());
      for (let i = 0; i < worker1Tasks.length; ++i) {
        console.log('before if');
        console.log('test: ', i, worker1Tasks.length);
        if (!worker1Tasks[i].done) {
          console.log('after if');

          let tempScorePerHour = 0;
          console.log('location: ', tempLocation[0], tempLocation[1]);
          travelTime = timeToGetFacility(
            tempLocation,
            worker1Tasks[i].location,
          );
          console.log('travel time: ', travelTime);
          if (time1 - (worker1Tasks[i].timeToComplete + travelTime) < 0) {
            tempScorePerHour =
              (score(worker1Tasks[i]) *
                ((time1 - travelTime) / worker1Tasks[i].timeToComplete)) /
              time1;
          } else {
            tempScorePerHour =
              score(worker1Tasks[i]) /
              (worker1Tasks[i].timeToComplete + travelTime);
          }
          console.log('score: ', score(worker1Tasks[i]));
          console.log('temp: ', tempScorePerHour);

          if (tempScorePerHour > bestScorePerHour) {
            bestScorePerHour = tempScorePerHour;
            bestOrder = worker1Tasks[i];
            bestOrderInd = i;
            bestTravelTime = travelTime;
          }
        }
      }
      if (bestScorePerHour > 0) {
        worker1Tasks.splice(bestOrderInd, 1);
        //bestOrder.done = true;
        tasks1.push(bestOrder);
        console.log(bestOrder.eID);

        console.log(bestScorePerHour);
        if (time1 - (bestOrder.timeToComplete + bestTravelTime) < 0) {
          total1 += bestScorePerHour * time1;
          time1 = 0;
        } else {
          total1 += score(bestOrder);
          time1 -= bestOrder.timeToComplete + bestTravelTime;
        }
        console.log(bestOrder.timeToComplete);

        tempLocation = bestOrder.location;
      } else {
        break;
      }
    }
    return [tasks1, total1];
  }
}
