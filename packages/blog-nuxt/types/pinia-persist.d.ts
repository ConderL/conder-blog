import 'pinia';

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: {
      key?: string;
      storage?: Storage;
      paths?: string[];
      beforeRestore?: (context: {
        store: Store;
        storage: Storage;
      }) => void;
      afterRestore?: (context: {
        store: Store;
        storage: Storage;
      }) => void;
      debug?: boolean;
      serializer?: {
        serialize: (value: any) => string;
        deserialize: (value: string) => any;
      };
    };
  }
} 