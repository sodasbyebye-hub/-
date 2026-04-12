import { ref, onUnmounted } from 'vue';
import Peer, { DataConnection } from 'peerjs';
import { Matrix, TetrominoType, Piece } from '../engine/types';

/**
 * 联机数据包协议
 */
export type OnlinePacket = 
  | { type: 'SYNC_SEED'; seed: number }
  | { type: 'SYNC_STATE'; matrix: Matrix; score: number; level: number; combo: number; nextType: TetrominoType | null; currentPiece: Piece | null }
  | { type: 'GARBAGE'; count: number }
  | { type: 'GAME_OVER' }
  | { type: 'RESTART'; seed: number };

/**
 * useOnline: 管理 PeerJS 生命周期与对战同步
 */
export function useOnline() {
  const peer = ref<Peer | null>(null);
  const conn = ref<DataConnection | null>(null);
  const selfId = ref('');
  const remoteId = ref('');
  const isConnected = ref(false);
  const error = ref('');

  // 接收到的远程状态
  const remoteState = ref<{
    matrix: Matrix | null;
    score: number;
    level: number;
    combo: number;
    nextType: TetrominoType | null;
    currentPiece: Piece | null;
  }>({
    matrix: null,
    score: 0,
    level: 1,
    combo: 0,
    nextType: null,
    currentPiece: null
  });

  // 回调接口
  let onReceiveGarbage: (count: number) => void = () => {};
  let onRemoteGameOver: () => void = () => {};
  let onSyncSeed: (seed: number) => void = () => {};

  /**
   * 初始化 Peer
   */
  const initPeer = () => {
    peer.value = new Peer();
    
    peer.value.on('open', (id) => {
      selfId.value = id;
      console.log('Peer ID:', id);
    });

    peer.value.on('connection', (connection) => {
      // 被动连接（房主）
      handleConnection(connection);
    });

    peer.value.on('error', (err) => {
      error.value = err.message;
      console.error('Peer Error:', err);
    });
  };

  /**
   * 连接到对方（加入者）
   */
  const connectToPeer = (id: string) => {
    if (!peer.value) return;
    const connection = peer.value.connect(id);
    handleConnection(connection);
  };

  const handleConnection = (connection: DataConnection) => {
    conn.value = connection;
    remoteId.value = connection.peer;
    
    connection.on('open', () => {
      isConnected.value = true;
      console.log('Connected to:', connection.peer);
    });

    connection.on('data', (data) => {
      const packet = data as OnlinePacket;
      switch (packet.type) {
        case 'SYNC_SEED':
          onSyncSeed(packet.seed);
          break;
        case 'SYNC_STATE':
          remoteState.value = {
            matrix: packet.matrix,
            score: packet.score,
            level: packet.level,
            combo: packet.combo,
            nextType: packet.nextType,
            currentPiece: packet.currentPiece
          };
          break;
        case 'GARBAGE':
          onReceiveGarbage(packet.count);
          break;
        case 'GAME_OVER':
          onRemoteGameOver();
          break;
        case 'RESTART':
          onSyncSeed(packet.seed);
          break;
      }
    });

    connection.on('close', () => {
      isConnected.value = false;
      conn.value = null;
    });
  };

  /**
   * 发送数据
   */
  const send = (packet: OnlinePacket) => {
    if (conn.value && isConnected.value) {
      conn.value.send(packet);
    }
  };

  onUnmounted(() => {
    peer.value?.destroy();
  });

  return {
    selfId,
    remoteId,
    isConnected,
    error,
    remoteState,
    initPeer,
    connectToPeer,
    send,
    onReceiveGarbage: (cb: typeof onReceiveGarbage) => { onReceiveGarbage = cb; },
    onRemoteGameOver: (cb: typeof onRemoteGameOver) => { onRemoteGameOver = cb; },
    onSyncSeed: (cb: typeof onSyncSeed) => { onSyncSeed = cb; }
  };
}
