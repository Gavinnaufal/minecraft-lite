import { WebSocketServer, WebSocket } from 'ws';

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

interface ConnectedPlayer {
  id: string;
  ws: WebSocket;
  x: number;
  y: number;
  z: number;
}

const players = new Map<string, ConnectedPlayer>();

console.log(`[Multiplayer Server] WebSocket server listening on ws://localhost:${PORT}`);

wss.on('connection', (ws: WebSocket) => {
  const id = `player_${Math.random().toString(36).substring(2, 9)}`;
  console.log(`[Multiplayer Server] Client connected: ${id}`);

  players.set(id, { id, ws, x: 0, y: 60, z: 0 });

  // Send welcome message with assigned ID
  ws.send(JSON.stringify({ type: 'init', id }));

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'position') {
        const p = players.get(id);
        if (p) {
          p.x = msg.x;
          p.y = msg.y;
          p.z = msg.z;
        }
        // Broadcast position update to all other connected clients
        const broadcastMsg = JSON.stringify({ type: 'player_moved', id, x: msg.x, y: msg.y, z: msg.z });
        for (const [otherId, player] of players) {
          if (otherId !== id && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(broadcastMsg);
          }
        }
      } else if (msg.type === 'block_change') {
        const broadcastMsg = JSON.stringify({
          type: 'block_change',
          x: msg.x,
          y: msg.y,
          z: msg.z,
          blockId: msg.blockId,
        });
        for (const [otherId, player] of players) {
          if (otherId !== id && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(broadcastMsg);
          }
        }
      } else if (msg.type === 'mob_damage') {
        const broadcastMsg = JSON.stringify({
          type: 'mob_damage',
          mobIndex: msg.mobIndex,
          damage: msg.damage,
        });
        for (const [otherId, player] of players) {
          if (otherId !== id && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(broadcastMsg);
          }
        }
      } else if (msg.type === 'chat') {
        const broadcastMsg = JSON.stringify({
          type: 'chat',
          id,
          text: msg.text,
        });
        for (const [otherId, player] of players) {
          if (otherId !== id && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(broadcastMsg);
          }
        }
      }
    } catch (err) {
      console.error(`[Multiplayer Server] Error processing message from ${id}:`, err);
    }
  });

  ws.on('close', () => {
    console.log(`[Multiplayer Server] Client disconnected: ${id}`);
    players.delete(id);
    const disconnectMsg = JSON.stringify({ type: 'player_disconnected', id });
    for (const player of players.values()) {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(disconnectMsg);
      }
    }
  });

  ws.on('error', (err) => {
    console.error(`[Multiplayer Server] WebSocket error on ${id}:`, err);
  });
});
