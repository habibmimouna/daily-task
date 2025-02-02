import {
    collection,
    query,
    where,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    setDoc,
    Timestamp
} from 'firebase/firestore';
import { db, auth, storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Task, TaskCategory } from '../types/task';
import { UserData, TaskHelper } from '../types/user';


export const firestoreService = {
    async createTask(task: Omit<Task, 'id'>, userId: string) {
        const tasksRef = collection(db, 'tasks');
        const docRef = await addDoc(tasksRef, {
            ...task,
            userId,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    },

    async getTasks(userId: string, category: TaskCategory) {
        const tasksRef = collection(db, 'tasks');
        const q = query(
            tasksRef,
            where('userId', '==', userId),
            where('category', '==', category)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Task[];
    },

    async updateTaskStatus(taskId: string, completed: boolean) {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, { completed });
    },

    async deleteTask(taskId: string) {
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);
    },

    async getUserProfile() {
        if (!auth.currentUser) throw new Error('No authenticated user');

        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserData;
        }
        return null;
    },

    async updateUserProfile(updates: Partial<UserData>) {
        if (!auth.currentUser) throw new Error('No authenticated user');

        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: Timestamp.now()
        });
    },

    async createUserProfile(userData: {
        displayName: string;
        email: string;
        phoneNumber: string;
        profilePictureUrl?: string;
    }) {
        console.log("createUserProfile", userData.displayName, userData.email, userData.phoneNumber);

        if (!auth.currentUser) {
            throw new Error('No authenticated user');
        }

        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, {
                ...userData,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                userId: auth.currentUser.uid
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    },

    async findUserByPhone(phoneNumber: string) {
        console.log("phoneNumber", phoneNumber);

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
        console.log("query", q);

        try {
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data() as UserData;
                return {
                    id: querySnapshot.docs[0].id,
                    ...userData
                };
            }
            return null;
        } catch (error) {
            console.error("Error finding user by phone number: ", error);
            throw error;
        }
    },

    async addTaskHelper(taskId: string, helperData: TaskHelper) {
        const taskRef = doc(db, 'tasks', taskId);
        const helpersRef = collection(taskRef, 'helpers');
        await addDoc(helpersRef, {
            ...helperData,
            addedAt: Timestamp.now()
        });
    },

    async getTaskHelpers(taskId: string) {
        const taskRef = doc(db, 'tasks', taskId);
        const helpersRef = collection(taskRef, 'helpers');
        const querySnapshot = await getDocs(helpersRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as (TaskHelper & { id: string })[];
    },

    async updateHelperStatus(taskId: string, helperId: string, status: 'accepted' | 'rejected') {
        const helperRef = doc(db, 'tasks', taskId, 'helpers', helperId);
        await updateDoc(helperRef, { status });
    },
    async uploadProfilePicture(file: File): Promise<string> {
        if (!auth.currentUser) throw new Error('No authenticated user');

        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    },

};