import { Socket, Server as SocketIOServer } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { User } from "../types/User";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
}
let users = [] as User[]; // Connected users

export default function socketHandle({ io }: Props) {
  function handleClose(id: string) {
    // Remove user from the list
    users = users.filter((user: User) => user.id !== id);
    // Sends new list of users to everyone connected
    io.emit("users-update", users);
  }
  function addNewUser({ id, deviceName }: User) {
    const extractNumber = (name: string) => {
      const match = name.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 1;
    };
    let highestNumber = 0;
    users.forEach((user) => {
      if (user.deviceName.startsWith(deviceName)) {
        const number = extractNumber(user.deviceName);
        if (number >= highestNumber) {
          highestNumber = number;
        }
      }
    });
    if (highestNumber > 0) {
      deviceName = `${deviceName} #${highestNumber + 1}`;
    }
    id &&
      users.push({
        id: id,
        deviceName: deviceName,
      });
    io.emit("users-update", users);
  }
  function handleUserMessage(message: string, deviceName: string) {
    io.emit("message", `Device ${deviceName} sent message: ${message}`);
  }
  io.on("connection", (socket: Socket) => {
    // Get the query parameters from the handshake
    const { deviceName } = socket.handshake.query as { deviceName: string };
    addNewUser({
      id: socket.id,
      deviceName,
    });
    // Handle the disconnect event
    socket.on("disconnect", () => handleClose(socket.id));
    // Handle the message event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("message", (msg: any) => {
      handleUserMessage(msg, deviceName);
    });
    // Listening for a message from the dashboard to a device
    socket.on(
      "sendToSpecificClient",
      ({
        targetClientId,
        message,
      }: {
        targetClientId: string;
        message: string;
      }) => {
        io.to(targetClientId).emit("message", message);
      }
    );
  });
}
