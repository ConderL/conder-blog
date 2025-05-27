// Socket.IO 客户端插件
import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      io
    }
  };
});