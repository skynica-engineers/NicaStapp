import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from './api';

const SYNC_QUEUE_KEY = '@offline_sync_queue';

interface SyncRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

export const syncService = {
  enqueueRequest: async (url: string, method: string = 'POST', body?: any) => {
    try {
      const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncRequest[] = queueStr ? JSON.parse(queueStr) : [];
      
      const newRequest: SyncRequest = {
        id: Math.random().toString(36).substring(7),
        url,
        method,
        body,
        timestamp: Date.now()
      };
      
      queue.push(newRequest);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      return newRequest.id;
    } catch (e) {
      console.error('Error enqueuing request:', e);
      throw e;
    }
  },

  getQueue: async (): Promise<SyncRequest[]> => {
    try {
      const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return queueStr ? JSON.parse(queueStr) : [];
    } catch (e) {
      console.error('Error getting sync queue:', e);
      return [];
    }
  },

  processQueue: async () => {
    const queue = await syncService.getQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} offline requests...`);
    const remainingQueue: SyncRequest[] = [];

    for (const req of queue) {
      try {
        await apiCall(req.url, req.method, req.body);
        console.log(`Successfully synced offline request ${req.id} to ${req.url}`);
      } catch (e) {
        console.error(`Failed to sync request ${req.id}, keeping in queue:`, e);
        remainingQueue.push(req);
      }
    }

    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
  },
  
  clearQueue: async () => {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  }
};
