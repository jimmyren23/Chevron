const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const db = admin.firestore();

/*
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to Cloud Firestore.
        const original = snap.data().original;

        // Access the parameter `{documentId}` with `context.params`
        functions.logger.log('Uppercasing', context.params.documentId, original);

        const uppercase = original.toUpperCase();

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to Cloud Firestore.
        // Setting an 'uppercase' field in Cloud Firestore document returns a Promise.
        return snap.ref.set({ uppercase }, { merge: true });
    });
*/

exports.main = functions.https.onRequest(async (request, response) => {
  const ref = db.collection('workers');
  const snapshot = await ref.get();
  var tempWorkers = [];
  snapshot.forEach((doc) => {
    //console.log(doc.id, '=>', doc.data());

    var certifications = doc.data().Certifications;

    var location = doc.data().Location;
    var shift = doc.data().Shift;
    var temp = new Worker(doc.id, certifications, location, shift);
    tempWorkers.push(temp);
    console.log(tempWorkers.length);
    console.log(tempWorkers[0].certifications);

    //console.log(tempWorkers[i].certifications);
  });
  console.log(tempWorkers[1].certifications[0]);

  const ref2 = db.collection('facility');
  const snapshot2 = await ref2.get();
  var tempFacilities = [];
  snapshot2.forEach((doc) => {
    //console.log(doc.id, '=>', doc.data());
    var location = [
      doc.data().Location.longitude,
      doc.data().Location.latitude,
    ];
    var maxOcc = doc.get('Max Occupancy');

    console.log(maxOcc.toString());
    var temp2 = new Facility(doc.id, location, maxOcc);
    tempFacilities.push(temp2);
  });

  const ref3 = db.collection('sample work order');
  const snapshot3 = await ref3.get();
  var tempWorkOrders = [];
  snapshot3.forEach((doc) => {
    //console.log(doc.d, '=>', doc.data());
    var eid = doc.get('Equipment ID');
    console.log(eid);
    var etype = doc.get('Equipment Type');
    console.log(etype);
    var facility = doc.data().Facility;
    var location = getFCoord(facility, tempFacilities);
    var priority = doc.get('Priority(1-5)');
    var submissionTime = doc.get('Submission Timestamp');
    var timeToComplete = doc.get('Time to Complete');
    var temp3 = new WorkOrder(
      eid,
      etype,
      facility,
      location,
      priority,
      submissionTime,
      timeToComplete,
    );
    console.log(temp3.eID);
    console.log(temp3.eType);

    tempWorkOrders.push(temp3);
  });
  console.log(tempWorkOrders[0].eID);

  console.log('before assign schedule');
  assignSchedule(tempWorkers, tempWorkOrders);
  console.log('pass assign schedule');
  for (var i = 0; i < tempWorkers.length; ++i) {
    // collection should be named schedules
    // id is worker name
    // field is array of schedules
    db.collection('schedules')
      .doc(tempWorkers[i].name)
      .set({schedule: tempWorkers[i].schedule});
    //writeToFirebase();
  }
});

/*
exports.updateWorkOrders = functions.firestore
    .document('sample work order/{docId}')
    .onUpdate((change, context) => {
        // Get an object representing the current document
        const newWorkOrderList = change.after.data();
    });
*/

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

function getFCoord(inFacility, facilities) {
  for (var i = 0; i < facilities.length; ++i) {
    if (inFacility === facilities[i].name) {
      return [facilities[i].lat, facilities[i].long];
    }
  }
}

// if a task is completed, we remove the work order
// if a task isn't completed by shift end, we subtract the time spent on the task and change the work order to reflect that

// two points (long, lat) distance function

function distBetweenTwoGeoPoints(lat, long, lat2, long2) {
  const earthRadius = 6371;
  var deltaPhi = ((lat2 - lat) * Math.PI) / 180;
  var deltaLambda = ((long2 - long) * Math.PI) / 180;

  phi1 = (lat * Math.PI) / 180;
  phi2 = (lat2 * Math.PI) / 180;

  var a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  var c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

// initial schedule for the day will come from all work orders that haven't been completed before their shift

//based upon technician certification we'd filter the work orders applicable

// variables for optimization
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

function listOfTasksPerWorker(workers, workorders) {
  numWorkers = workers.length;
  numTasks = workorders.length;

  possibleTasks = [];
  for (var i = 0; i < numWorkers; ++i) {
    var taskList = [];
    for (var j = 0; j < numTasks; ++j) {
      console.log('equipment ' + workorders[j].eType);
      for (var k = 0; k < workers[i].certifications.length; ++k) {
        console.log('certif ' + workorders[i].certifications[k]);
        if (workorders[j].eType === workers[i].certifications[k]) {
          //check certifications
          taskList.push(workorders[j]);
        }
      }
    }
    possibleTasks.push(taskList);
  }

  return possibleTasks;
}

//given task will be apart of taskList
function removeTask(task, taskList) {
  newArr = [];
  for (var i = 0; i < taskList.length; ++i) {
    if (task.eID === taskList[i].eID) {
      newArr = taskList.slice(i, i + 1);
      return newArr;
    }
  }
}

// while workers have shift
// go through workorders
// terminates either when all the workers shifts are full or when there are no work orders
function assignSchedule(workers, workorders) {
  var numDone = 0;
  while (numDone < workers.length && workorders.length > 0) {
    console.log('before choose workers');
    chooseWorkers(workers, workorders);
    console.log('pass choose workers');
    for (var i = 0; i < workers.length; ++i) {
      if (workers[i].timeLeftinShift <= 0) {
        ++numDone;
      }
    }
  }
}

//change time left in workshift
//change location of worker
//say task is assigned, and remove from workorder IF COMPLETED
function assignTask(worker, workorder, workorders) {
  var taskTime =
    workorder.timeToComplete +
    timeToGetFacility(worker.location, workorder.location);
  if (worker.timeLeftinShift < taskTime) {
    worker.timeLeftinShift = 0;
    workorder.timeToComplete = worker.timeToComplete - worker.timeLeftinShift;
  } else {
    worker.timeLeftinShift = worker.timeLeftinShift - taskTime;
    workorder.timeToComplete = 0;
    workorders = removeTask(workorder, workorders);
  }

  worker.location = workorder.location;
  worker.schedule.push(workorder);
  console.log('assign task');
}

function chooseWorkers(workers, workorders) {
  for (var i = 0; i < workers.length; ++i) {
    var keep = true;

    var worker1Tasks = listOfTasksPerWorker(workers, workorders)[i];
    console.log('pass tasks per worker');
    bestTaskw1 = oneSchedule(workers[i], worker1Tasks)[0][0];
    console.log('pass schedule');
    if (!workers[i].doneScheduling) {
      for (var j = i + 1; j < workers.length; ++j) {
        if (!workers[j].doneScheduling) {
          var worker2Tasks = listOfTasksPerWorker(workers, workorders)[j];
          bestTaskw2 = oneSchedule(workers[j], worker2Tasks)[0][0];

          if (bestTaskw1.eID === bestTaskw2.eID) {
            w1SecondSchedule = oneSchedule(
              workers[i],
              removeTask(bestTaskw1, worker1Tasks),
            );
            w2SecondSchedule = oneSchedule(
              workers[j],
              removeTask(bestTaskw1, worker1Tasks),
            );

            if (
              bestTaskw1[1] - w1SecondSchedule[1] <
              bestTaskw2[1] - w2SecondSchedule[1]
            ) {
              keep = false;
              i = i - 1;
              possibleTasks[i] = removeTask(bestTaskw1, possibleTasks[i]);
              break;
            }
          }
        }
      }
      if (keep) {
        assignTask(workers[i], bestTaskw1, workorders);
      }
    }
  }
}

function timeToGetFacility(point1, point2) {
  const avgSpdKm = 70;
  var timeToGetThere =
    distBetweenTwoGeoPoints(point1[0], point1[1], point2[0], point2[1]) /
    avgSpdKm;

  return timeToGetThere;
}

function oneSchedule(worker1, worker1Tasks) {
  var time1 = worker1.timeLeftinShift;
  var total1 = 0;
  var tasks1 = [];

  var tempLocation = worker1.location;
  while (time1 > 0) {
    var bestOrder;
    var bestOrderInd;
    var bestScorePerHour = 0;
    var travelTime = 0;
    var bestTravelTime = 0;
    console.log('before for');
    console.log(worker1Tasks.length.toString());
    for (var i = 0; i < worker1Tasks.length; ++i) {
      console.log('before if');

      if (!worker1Tasks[i].done) {
        console.log('after if');

        var tempScorePerHour;
        travelTime = timeToGetFacility(tempLocation, worker1Tasks[i].location);
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
        console.log(tempScorePerHour);

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
        total1 += score(worker1.taskList[i]);
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
