import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DocumentDB extends DBSchema {
    documents: {
        key: string;
        value: {
            id: string;
            type: 'rgp' | 'cpf' | 'address';
            blob: Blob;
            timestamp: number;
        };
    };
}

const DB_NAME = 'SeguroDefesoDocs';
const STORE_NAME = 'documents';

let dbPromise: Promise<IDBPDatabase<DocumentDB>>;

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<DocumentDB>(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            },
        });
    }
    return dbPromise;
};

export const saveDocument = async (type: 'rgp' | 'cpf' | 'address', blob: Blob) => {
    const db = await initDB();
    const id = type; // Simple ID for now, one per type
    await db.put(STORE_NAME, {
        id,
        type,
        blob,
        timestamp: Date.now(),
    });
};

export const getDocument = async (type: 'rgp' | 'cpf' | 'address'): Promise<Blob | null> => {
    const db = await initDB();
    const record = await db.get(STORE_NAME, type);
    return record ? record.blob : null;
};

export const getAllDocuments = async () => {
    const db = await initDB();
    return await db.getAll(STORE_NAME);
};

export const deleteDocument = async (type: 'rgp' | 'cpf' | 'address') => {
    const db = await initDB();
    await db.delete(STORE_NAME, type);
};
