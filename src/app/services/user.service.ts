import { Injectable } from '@angular/core';
import { User } from 'src/models/user.class';
import { Firestore, collectionData, collection, CollectionReference, WhereFilterOp, Query, QueryConstraint, orderBy } from '@angular/fire/firestore';
import { DocumentData, onSnapshot, getDoc, setDoc, updateDoc, deleteDoc, doc, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  coll: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.coll = collection(this.firestore, 'address');
  }


  async getUserDoc(id:string) {
    const docRef = doc(this.coll, id);
    return await getDoc(docRef)
      .then(res => res.data() || {})
      .catch((err) => ({error: err}));
  }


  getUserList() {
    return collectionData(this.coll);
  }


  selectFromUserWhere(field: keyof(User), operator: WhereFilterOp, value: any, order?: 'desc' | 'asc') {
    return (
      collectionData(query(this.coll, where(field, operator, value), orderBy(field, order))) ||
      collectionData(query(this.coll, where(field, operator, value)))
    );
  }


  async createUser(user:User) {
    try {
      const newDocRef = doc(this.coll);
      user.id = newDocRef.id;
      await setDoc(newDocRef, user.toJSON());
      console.log(`New user written to backend successfully. id: ${newDocRef.id}, path: ${newDocRef.path}`);
    }
    catch (error) {
      console.error('Failed to write new user to backend: ', error);
    }
  }


  async deleteUser(user:User) {
    try {
      const docRef = doc(this.coll, user.id);
      await deleteDoc(docRef);
      console.log(`User '${user.firstName} ${user.lastName}' deleted successfully. id: ${docRef.id}, path: ${docRef.path}`);
    }
    catch (error) {
      console.error('Failed to delete user: ', error);
    }
  }
  

  async updateUser(user:User) {
    try {
      const docRef = doc(this.coll, user.id);
      const userData:any = user.toJSON();
      await updateDoc(docRef, userData);
      console.log(`User '${userData.firstName} ${userData.lastName}' updated successfully. id: ${docRef.id}, path: ${docRef.path}`);
    }
    catch (error) {
      console.error('Failed to update user: ', error);
    }
  }
}
