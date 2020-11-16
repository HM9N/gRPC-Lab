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

/**
   Grant an employee leave days
   */
function grantLeave(call, callback) {
  
  const requestedDays = call.request.requested_leave_days;
  const availableDays = call.request.accrued_leave_days;

  if(requestedDays <= 0){
    callback(new Error("Has solicitado un número inválido de dias"));
    return;
  }

  if(availableDays <= 0){
    callback(new Error("No tienes dias válidos acumulados"));
    return;
  }

  const granted = availableDays >= requestedDays;

  callback(null, {
    granted: granted ,
    granted_leave_days: granted ? requestedDays : 0,
    accrued_leave_days: granted ? availableDays - requestedDays : availableDays
  });
  
}


// Add the implemented methods to the service.
server.addService(proto.work_leave.EmployeeLeaveDaysService.service, {
  grantLeave: grantLeave,
});

server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
server.start();
