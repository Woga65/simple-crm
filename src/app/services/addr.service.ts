import { Injectable } from '@angular/core';
import { Addr } from 'src/models/addr.class';
import { Firestore, collectionData, collection, CollectionReference, WhereFilterOp, orderBy } from '@angular/fire/firestore';
import { DocumentData, onSnapshot, getDoc, setDoc, updateDoc, deleteDoc, doc, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AddrService {

  coll: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.coll = collection(this.firestore, 'address');
  }


  async getAddrDoc(id:string) {
    const docRef = doc(this.coll, id);
    return await getDoc(docRef)
      .then(res => res.data() || {})
      .catch((err) => ({error: err}));
  }


  getAddrList() {
    return collectionData(this.coll);
  }


  selectFromAddrWhere(field: keyof(Addr), operator: WhereFilterOp, value: any, order?: 'desc' | 'asc') {
    return (
      collectionData(query(this.coll, where(field, operator, value), orderBy(field, order))) ||
      collectionData(query(this.coll, where(field, operator, value)))
    );
  }


  async createAddr(addr:Addr) {
    try {
      const newDocRef = doc(this.coll);
      addr.id = newDocRef.id;
      await setDoc(newDocRef, addr.toJSON());
      console.log(`New address written to backend successfully. id: ${newDocRef.id}, path: ${newDocRef.path}`);
    }
    catch (error) {
      console.error('Failed to write new address to backend: ', error);
    }
  }


  async deleteAddr(addr:Addr) {
    try {
      const docRef = doc(this.coll, addr.id);
      await deleteDoc(docRef);
      console.log(`Address '${addr.firstName} ${addr.lastName}' deleted successfully. id: ${docRef.id}, path: ${docRef.path}`);
    }
    catch (error) {
      console.error('Failed to delete address: ', error);
    }
  }
  

  async updateAddr(addr:Addr) {
    try {
      const docRef = doc(this.coll, addr.id);
      const addrData:any = addr.toJSON();
      await updateDoc(docRef, addrData);
      console.log(`Address '${addrData.firstName} ${addrData.lastName}' updated successfully. id: ${docRef.id}, path: ${docRef.path}`);
    }
    catch (error) {
      console.error('Failed to update address: ', error);
    }
  }
}
