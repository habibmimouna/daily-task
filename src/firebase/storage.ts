import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from './config';

const storage = getStorage();

export const storageService = {
    async uploadProfilePicture(file: File) {
        if (!auth.currentUser) throw new Error('No authenticated user');

        const fileExtension = file.name.split('.').pop();
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}.${fileExtension}`);
        
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            throw error;
        }
    }
};