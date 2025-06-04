import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

// Hook para obtener datos de colección
export const useFirestore = (collectionName, filters = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let q = query(collection(db, collectionName));
        filters.forEach((filter) => {
          q = where(...filter);
        });

        const querySnapshot = await getDocs(q);
        const docs = [];
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setData(docs);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, filters]);

  return { data, loading, error };
};

// Hook para agregar documento
export const useAddDocument = (collectionName) => {
  const addDocument = async (data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  };

  return addDocument;
};

// Hook para actualizar documento
export const useUpdateDocument = (collectionName) => {
  const updateDocument = async (id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      throw error;
    }
  };

  return updateDocument;
};

// Hook para eliminar documento
export const useDeleteDocument = (collectionName) => {
  const deleteDocument = async (id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    }
  };

  return deleteDocument;
};
