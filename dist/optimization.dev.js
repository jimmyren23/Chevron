"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assignWorker = assignWorker;

var _firestore = _interopRequireDefault(require("@react-native-firebase/firestore"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function Worker(name, certifications, shift, location) {
  _classCallCheck(this, Worker);

  this.name = name;
  this.certifications = certifications;
  this.shift = shift;
  this.location = location;
  this.currentPosition = location;
  this.timeLeftinShift = 8;
  this.schedule = [];
  this.doneScheduling = false;
};

var WorkOrder = function WorkOrder(eID, eType, facility, location, priority, timeStamp, timeToComplete) {
  _classCallCheck(this, WorkOrder);

  this.eID = eID;
  this.eType = eType;
  this.facility = facility;
  this.location = location;
  this.priority = priority;
  this.timeStamp = timeStamp;
  this.timeToComplete = timeToComplete;
  this.done = false;
};

var Facility = function Facility(name, location, maxOcc) {
  _classCallCheck(this, Facility);

  this.name = name;
  this.location = location;
  this.maxOcc = maxOcc;
  this.curOcc = 0;
}; //assigns a worker


function assignWorker() {
  var tempWorkers = [];

  function workers() {
    var workersCollection;
    return regeneratorRuntime.async(function workers$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap((0, _firestore["default"])().collection('workers').get().then(function _callee2(querySnapshot) {
              return regeneratorRuntime.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      querySnapshot.forEach(function _callee(documentSnapshot) {
                        var temp;
                        return regeneratorRuntime.async(function _callee$(_context) {
                          while (1) {
                            switch (_context.prev = _context.next) {
                              case 0:
                                temp = new Worker(documentSnapshot.id, documentSnapshot.data().Certifications, documentSnapshot.data().Shift, [documentSnapshot.data().Location.longitude, documentSnapshot.data().Location.latitude]);
                                tempWorkers.push(temp);

                              case 2:
                              case "end":
                                return _context.stop();
                            }
                          }
                        });
                      });

                    case 1:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            }));

          case 2:
            workersCollection = _context3.sent;
            return _context3.abrupt("return", tempWorkers);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    });
  }

  var tempFacilities = [];

  function Facilities() {
    var tempFacilities, facilitiesCollection;
    return regeneratorRuntime.async(function Facilities$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            tempFacilities = [];
            _context6.next = 3;
            return regeneratorRuntime.awrap((0, _firestore["default"])().collection('facility').get().then(function _callee4(querySnapshot) {
              return regeneratorRuntime.async(function _callee4$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      querySnapshot.forEach(function _callee3(documentSnapshot) {
                        var temp;
                        return regeneratorRuntime.async(function _callee3$(_context4) {
                          while (1) {
                            switch (_context4.prev = _context4.next) {
                              case 0:
                                temp = new Facility(documentSnapshot.id, [documentSnapshot.data().Location.longitude, documentSnapshot.data().Location.latitude], documentSnapshot.data()['Max Occupancy']);
                                tempFacilities.push(temp);

                              case 2:
                              case "end":
                                return _context4.stop();
                            }
                          }
                        });
                      });

                    case 1:
                    case "end":
                      return _context5.stop();
                  }
                }
              });
            }));

          case 3:
            facilitiesCollection = _context6.sent;
            return _context6.abrupt("return", tempFacilities);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    });
  }

  var tempWorkOrders = [];

  function workOrders() {
    var tempWorkOrders, workOrdersCollection;
    return regeneratorRuntime.async(function workOrders$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            tempWorkOrders = [];
            _context9.next = 3;
            return regeneratorRuntime.awrap((0, _firestore["default"])().collection('sample work order').get().then(function _callee6(querySnapshot) {
              return regeneratorRuntime.async(function _callee6$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      querySnapshot.forEach(function _callee5(documentSnapshot) {
                        var temp;
                        return regeneratorRuntime.async(function _callee5$(_context7) {
                          while (1) {
                            switch (_context7.prev = _context7.next) {
                              case 0:
                                temp = new WorkOrder(documentSnapshot.data()['Equipment ID'], documentSnapshot.data()['Equipment Type'], documentSnapshot.data().Facility, getFCoord(documentSnapshot.data().Facility, tempFacilities), documentSnapshot.data()['Priority(1-5)'], documentSnapshot.data()['Submission Timestamp'], documentSnapshot.data()['Time to Complete']);
                                tempWorkOrders.push(temp);

                              case 2:
                              case "end":
                                return _context7.stop();
                            }
                          }
                        });
                      });

                    case 1:
                    case "end":
                      return _context8.stop();
                  }
                }
              });
            }));

          case 3:
            workOrdersCollection = _context9.sent;
            return _context9.abrupt("return", tempWorkOrders);

          case 5:
          case "end":
            return _context9.stop();
        }
      }
    });
  } // final part


  console.log('Reached Assigned Schedule');
  workOrders().then(function (y) {
    workers().then(function (z) {
      assignSchedule(z, y);

      for (var i = 0; i < z.length; ++i) {
        (0, _firestore["default"])().collection('schedules').doc(tempWorkers[i].name).set({
          schedule: tempWorkers[i].schedule
        }).then(function () {});
      }
    });
  });
  console.log('Reached Assigned Schedule');

  function getFCoord(inFacility) {
    Facilities().then(function (x) {
      for (var i = 0; i < x.length; ++i) {
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
  } // if a task is completed, we remove the work order
  // if a task isn't completed by shift end, we subtract the time spent on the task and change the work order to reflect that
  // two points (long, lat) distance function


  function distBetweenTwoGeoPoints(lat, _long, lat2, long2) {
    var earthRadius = 6371;
    var deltaPhi = (lat2 - lat) * Math.PI / 180;
    var deltaLambda = (long2 - _long) * Math.PI / 180;
    var phi1 = lat * Math.PI / 180;
    var phi2 = lat2 * Math.PI / 180;
    var a = Math.pow(Math.sin(deltaPhi / 2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(deltaLambda / 2), 2);
    var c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  } // initial schedule for the day will come from all work orders that haven't been completed before their shift
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
    workOrders().then(function (Workers) {
      workers().then(function (workorders) {
        var numWorkers = Workers.length;
        var numTasks = workorders.length;
        var possibleTasks = [];

        for (var i = 0; i < numWorkers; ++i) {
          var taskList = [];

          for (var j = 0; j < numTasks; ++j) {
            //console.log("equipment " + workorders[j].eType);
            for (var k = 0; k < workers[i].certifications.length; ++k) {
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
  } //given task will be apart of taskList


  function removeTask(task, taskList) {
    var newArr = [];

    for (var i = 0; i < taskList.length; ++i) {
      if (task.eID === taskList[i].eID) {
        newArr = taskList.slice(i, i + 1);
        return newArr;
      }
    }
  } // while workers have shift
  // go through workorders
  // terminates either when all the workers shifts are full or when there are no work orders


  function assignSchedule() {
    workOrders().then(function (Workers) {
      workers().then(function (workorders) {
        var numDone = 0;

        while (numDone < Workers.length && workorders.length > 0) {
          console.log('before choose workers');
          chooseWorkers(Workers, workorders);
          console.log('pass choose workers');

          for (var i = 0; i < Workers.length; ++i) {
            if (Workers[i].timeLeftinShift <= 0) {
              ++numDone;
            }
          }
        }
      });
    });
  } //change time left in workshift
  //change location of worker
  //say task is assigned, and remove from workorder IF COMPLETED


  function assignTask(worker, workorder) {
    workOrders().then(function (workorders) {
      var taskTime = workorder.timeToComplete + timeToGetFacility(worker.location, workorder.location);

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
    });
  }

  function chooseWorkers() {
    workOrders().then(function (Workers) {
      workers().then(function (workorders) {
        for (var i = 0; i < Workers.length; ++i) {
          var keep = true;
          var bestTaskw1 = void 0;
          var bestTaskw2 = void 0;
          var worker1Tasks = listOfTasksPerWorker(Workers, workorders)[i];
          console.log('tasks: ', worker1Tasks);
          var schedule = oneSchedule(Workers[i], worker1Tasks);

          if (!schedule[0].length) {
            break;
          } else {
            bestTaskw1 = schedule[0][0];
          }

          console.log('pass schedule');

          if (!Workers[i].doneScheduling) {
            for (var j = i + 1; j < Workers.length; ++j) {
              if (!Workers[j].doneScheduling) {
                var worker2Tasks = listOfTasksPerWorker(Workers, workorders)[j];
                var schedule2 = oneSchedule(Workers[j], worker2Tasks);

                if (!schedule2[0].length) {
                  break;
                } else {
                  bestTaskw2 = schedule[0][0];

                  if (bestTaskw1.eID === bestTaskw2.eID) {
                    var w1SecondSchedule = oneSchedule(Workers[i], removeTask(bestTaskw1, worker1Tasks));
                    var w2SecondSchedule = oneSchedule(Workers[j], removeTask(bestTaskw1, worker1Tasks));

                    if (bestTaskw1[1] - w1SecondSchedule[1] < bestTaskw2[1] - w2SecondSchedule[1]) {
                      keep = false;
                      i = i - 1; //fix next line

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
    var avgSpdKm = 70;
    var timeToGetThere = distBetweenTwoGeoPoints(point1[0], point1[1], point2[0], point2[1]) / avgSpdKm;
    return timeToGetThere;
  }

  function oneSchedule(worker1, worker1Tasks) {
    var time1 = worker1.timeLeftinShift;
    var total1 = 0;
    var tasks1 = [];
    var tempLocation = worker1.location;

    while (time1 > 0) {
      var bestOrder = void 0;
      var bestOrderInd = void 0;
      var bestScorePerHour = 0;
      var travelTime = 0;
      var bestTravelTime = 0;
      console.log('before for');
      console.log(worker1Tasks.length.toString());

      for (var i = 0; i < worker1Tasks.length; ++i) {
        console.log('before if');
        console.log('test: ', i, worker1Tasks.length);

        if (!worker1Tasks[i].done) {
          console.log('after if');
          var tempScorePerHour = 0;
          console.log('location: ', tempLocation[0], tempLocation[1]);
          travelTime = timeToGetFacility(tempLocation, worker1Tasks[i].location);
          console.log('travel time: ', travelTime);

          if (time1 - (worker1Tasks[i].timeToComplete + travelTime) < 0) {
            tempScorePerHour = score(worker1Tasks[i]) * ((time1 - travelTime) / worker1Tasks[i].timeToComplete) / time1;
          } else {
            tempScorePerHour = score(worker1Tasks[i]) / (worker1Tasks[i].timeToComplete + travelTime);
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
        worker1Tasks.splice(bestOrderInd, 1); //bestOrder.done = true;

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