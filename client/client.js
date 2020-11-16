const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");
const REMOTE_SERVER = "0.0.0.0:2019";

// Read terminal Lines
const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//Load the protobuf
let proto = grpc.loadPackageDefinition(
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

let username;

// Create gRPC client
// let client = new proto.chatGroup.Chat(
//     REMOTE_SERVER,
//     grpc.credentials.createInsecure()
// );

let client = new proto.work_leave.EmployeeLeaveDaysService(
  REMOTE_SERVER,
  grpc.credentials.createInsecure()
);

// Ask the user to enter name.
// reader.question("Please enter your name: ", (answer) => {
//     username = answer;
//     startChat();
// });

const userData = {
  employee_id: null,
  name: "",
  accrued_leave_days: null,
  requested_leave_days: null,
};

identifyUserData();

async function identifyUserData() {
  console.log("#################################");

  // Ask the id
  const idQuestion = () => {
    return new Promise((resolve, reject) => {
      reader.question("¿Cuál es tu cédula? ", (answer) => {
        userData.employee_id = parseInt(answer);
        resolve();
      });
    });
  };

  // Ask the name
  const nameQuestion = () => {
    return new Promise((resolve, reject) => {
      reader.question("¿Cuál es tu nombre? ", (answer) => {
        userData.name = answer;
        resolve();
      });
    });
  };

  // Ask the accrued days
  const accuredDays = () => {
    return new Promise((resolve, reject) => {
      reader.question(
        "¿Cuanto dias de permiso tienes disponibles? ",
        (answer) => {
          userData.accrued_leave_days = parseFloat(answer);
          resolve();
        }
      );
    });
  };

  // Ask the resuested days
  const resuestedDays = () => {
    return new Promise((resolve, reject) => {
      reader.question("¿Cuanto dias de permiso necesitas? ", (answer) => {
        userData.requested_leave_days = parseFloat(answer);
        resolve();
      });
    });
  };

  await idQuestion();
  await nameQuestion();
  await accuredDays();
  await resuestedDays();

  createRequest(userData);
}

function createRequest(requestData) {

  const requestRef = client.grantLeave(requestData, null, (err, res) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log("RESPUESTA ==> ", JSON.stringify(res));

    reader.question("¿Quieres hacer otra consulta? [si, no]", (answer) => {
      const answerUpper = answer.toUpperCase().trim();
      if (answerUpper === "SI") {
        identifyUserData();
      } else if (answerUpper === "NO") {
        console.log("bye...");
      }
    });

  });

}

//Start the stream between server and client
let startChat = () => {
  // Join the chat service
  let channel = client.join();

  // Write the request
  channel.write({ user: username, text: "I am joined the conversation..." });

  // get the data from response
  channel.on("data", (message) => {
    if (message.user == username) {
      return;
    }
    console.log(`${message.user}: ${message.text}`);
  });

  // Read the line from terminal
  reader.on("line", (text) => {
    channel.write({ user: username, text: text });
  });
};
