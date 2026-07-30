import * as THREE from 'three';

export class NetworkManager {
  private socket: WebSocket | null = null;
  private scene: THREE.Scene;
  private remotePlayers = new Map<string, THREE.Mesh>();
  private localId: string | null = null;
  private sendTimer = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  connect(url = 'ws://localhost:8080'): void {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('[NetworkManager] Connected to multiplayer server at', url);
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (err) {
          console.warn('[NetworkManager] Failed to parse message:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[NetworkManager] Disconnected from server');
        this.clearRemotePlayers();
      };

      this.socket.onerror = () => {
        console.warn('[NetworkManager] Server not reachable. Operating in singleplayer mode.');
      };
    } catch {
      console.warn('[NetworkManager] Could not initialize WebSocket');
    }
  }

  private onBlockChangeCallback: ((x: number, y: number, z: number, blockId: number) => void) | null = null;
  private onMobDamageCallback: ((mobIndex: number, damage: number) => void) | null = null;
  private onChatMessageCallback: ((author: string, text: string) => void) | null = null;

  setOnBlockChange(cb: (x: number, y: number, z: number, blockId: number) => void): void {
    this.onBlockChangeCallback = cb;
  }

  setOnMobDamage(cb: (mobIndex: number, damage: number) => void): void {
    this.onMobDamageCallback = cb;
  }

  setOnChatMessage(cb: (author: string, text: string) => void): void {
    this.onChatMessageCallback = cb;
  }

  private handleMessage(msg: { type: string; id?: string; x?: number; y?: number; z?: number; blockId?: number; mobIndex?: number; damage?: number; text?: string }): void {
    if (msg.type === 'init' && msg.id) {
      this.localId = msg.id;
      console.log('[NetworkManager] Local player assigned ID:', this.localId);
    } else if (msg.type === 'player_moved' && msg.id && msg.x !== undefined && msg.y !== undefined && msg.z !== undefined) {
      if (msg.id === this.localId) return;
      this.updateRemotePlayer(msg.id, msg.x, msg.y, msg.z);
    } else if (msg.type === 'player_disconnected' && msg.id) {
      this.removeRemotePlayer(msg.id);
    } else if (msg.type === 'block_change' && msg.x !== undefined && msg.y !== undefined && msg.z !== undefined && msg.blockId !== undefined) {
      this.onBlockChangeCallback?.(msg.x, msg.y, msg.z, msg.blockId);
    } else if (msg.type === 'mob_damage' && msg.mobIndex !== undefined && msg.damage !== undefined) {
      this.onMobDamageCallback?.(msg.mobIndex, msg.damage);
    } else if (msg.type === 'chat' && msg.id && msg.text) {
      this.onChatMessageCallback?.(msg.id.slice(0, 6), msg.text);
    }
  }

  sendChatMessage(text: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ type: 'chat', text }));
  }

  sendMobDamage(mobIndex: number, damage: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ type: 'mob_damage', mobIndex, damage }));
  }

  sendBlockChange(x: number, y: number, z: number, blockId: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ type: 'block_change', x, y, z, blockId }));
  }

  private updateRemotePlayer(id: string, x: number, y: number, z: number): void {
    let mesh = this.remotePlayers.get(id);
    if (!mesh) {
      const geo = new THREE.BoxGeometry(0.8, 1.8, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x3388ff });
      mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      this.remotePlayers.set(id, mesh);
    }
    mesh.position.set(x, y + 0.9, z);
  }

  private removeRemotePlayer(id: string): void {
    const mesh = this.remotePlayers.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      this.remotePlayers.delete(id);
    }
  }

  private clearRemotePlayers(): void {
    for (const id of this.remotePlayers.keys()) {
      this.removeRemotePlayer(id);
    }
  }

  sendPosition(x: number, y: number, z: number, deltaTime: number): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    this.sendTimer += deltaTime;
    if (this.sendTimer >= 0.05) {
      this.sendTimer = 0;
      this.socket.send(JSON.stringify({ type: 'position', x, y, z }));
    }
  }
}
