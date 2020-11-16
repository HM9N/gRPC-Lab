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

  const granted = availableDays >= requestedDays;

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
