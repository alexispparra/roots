
'use server';

import { getFirebaseInstances } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import type { SupplierFormData } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function addSupplier(data: SupplierFormData) {
  const { db } = getFirebaseInstances();
  await addDoc(collection(db, 'suppliers'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  revalidatePath('/suppliers');
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  const { db } = getFirebaseInstances();
  const supplierRef = doc(db, 'suppliers', id);
  await updateDoc(supplierRef, data);
  revalidatePath('/suppliers');
}

export async function deleteSupplier(id: string) {
  const { db } = getFirebaseInstances();
  const supplierRef = doc(db, 'suppliers', id);
  await deleteDoc(supplierRef);
  revalidatePath('/suppliers');
}
