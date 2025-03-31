# Testing Socket.IO with Postman

This guide explains how to test the simplified Socket.IO implementation.

> **Note**: The server port is defined in `src/config.ts` (and duplicated in `config.js` for the test client).
> If you change the port, make sure to update the WebSocket URL in these instructions.

## Method 1: Using Postman WebSocket Request

1. Open Postman and create a new WebSocket request.
2. Enter the Socket IO URL: `http://localhost:42831`  
   (Replace `42831` with your port if you've changed it in the config)
3. Click "Connect" to establish a WebSocket connection.
4. After connecting, send the Socket.IO handshake message: `40`
5. Once connected, send messages in this format: `42["message","Your message here"]`

### Example Message Sequence

1. Connect to the WebSocket URL
2. Send: `40` (handshake)
3. Send: `42["message","Testing from Postman"]`
4. You should see your message broadcast back to you

## Method 2: Using the Node.js Test Client

For easier testing, use the provided script:

1. Make sure the Electron app is running with `pnpm start`
2. In a new terminal, run `node socket-client.js`
3. Type messages and press Enter to send
4. All connected clients will receive the messages

## Using the Electron App UI

The app includes a message input field:

1. Type your message in the input box
2. Click "Send" or press Enter
3. Your message will be broadcast to all connected clients

## Troubleshooting

- Ensure the app is running and the server is started on the correct port
- Check terminal output for connection information
- Make sure there are no network restrictions blocking localhost connections
