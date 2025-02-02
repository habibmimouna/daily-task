export interface UserData {
    displayName: string;
    email: string;
    phoneNumber: string;
    createdAt: Date;
    profilePictureUrl?: string;
}

export interface TaskHelper {
    phoneNumber: string;
    displayName: string;
    status: 'pending' | 'accepted' | 'rejected';
}