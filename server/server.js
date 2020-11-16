const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const server = new grpc.Server();
const SERVER_ADDRESS = "0.0.0.0:2019";

// Load protobuf
const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync(
    __dirname + "/proto/vacaciones.proto",
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    }
  )
);

function eligibleForLeave(call, callback) {

  const requestedDays = call.request.requested_leave_days;
  const availableDays = call.request.accrued_leave_days;

  console.log("on eligibleForLeave fn");

  if (requestedDays > 0) {
    if (availableDays > requestedDays) {
      callback(null, { eligible: true });
    } else {
      callback(null, { eligible: false });
    }
    -1;
  } else {
    callback(new Error("Invalid requested days"));
  }
}
/**
   Grant an employee leave days
   */
function grantLeave(call, callback) {
  console.log("on ... grantLeave fn");

  const requestedDays = call.request.requested_leave_days;
  const availableDays = call.request.accrued_leave_days;

  const granted = availableDays <= requestedDays

  callback(null, {
    granted: granted ,
    granted_leave_days: granted ? requestedDays : 0,
    accrued_leave_days: granted ? availableDays - requestedDays : availableDays
  });
  
}


// Add the implemented methods to the service.
server.addService(proto.work_leave.EmployeeLeaveDaysService.service, {
  EligibleForLeave: eligibleForLeave,
  grantLeave: grantLeave,
});

server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
server.start();

// ---------------------------------

// const grpc = require("grpc");
// const proto = grpc.load("/mnt/d/juansanta/Documents/Projects/pipesanta/arqSof/lab03/chat-node/chat-group/proto/vacaciones.proto");
// const server = new grpc.Server();

// //define the callable methods that correspond to the methods defined in the protofile
// server.addProtoService(proto.work_leave.EmployeeLeaveDaysService.service, {

// //  Check if an employee is eligible for leave.
// //  True If the requested leave days are greater than 0 and within the number
// // of accrued days.

//   EligibleForLeave(call, callback) {
//     if (call.request.requested_leave_days > 0) {
//       if (call.request.accrued_leave_days > call.request.requested_leave_days) {
//         callback(null, { eligible: true });
//       } else {
//         callback(null, { eligible: false });
//       }
//       -1;
//     } else {
//       callback(new Error("Invalid requested days"));
//     }
//   },
//   /**
//  Grant an employee leave days
//  */
//   grantLeave(call, callback) {
//     let granted_leave_days = call.request.requested_leave_days;
//     let accrued_leave_days =
//       call.request.accrued_leave_days - granted_leave_days;
//     callback(null, {
//       granted: true,
//       granted_leave_days,
//       accrued_leave_days,
//     });
//   }

// });

// //Specify the IP and and port to start the grpc Server, no SSL in test environment
// server.bind("0.0.0.0:50050", grpc.ServerCredentials.createInsecure());

// //Start the server
// server.start();
// console.log("grpc server running on port:", "0.0.0.0:50050");
