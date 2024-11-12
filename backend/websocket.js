const WebSocket = require('ws');

let wss;

function setupWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.on('message', (message) => {
      console.log('Received:', message);
    });
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
}

function broadcastNotification(notification) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  });
}

module.exports = { setupWebSocketServer, broadcastNotification };