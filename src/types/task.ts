export interface Task {
    id: string;
    title: string;
    category: TaskCategory;
    priority: Priority;
    completed: boolean;
    createdAt: Date;
}

export type TaskCategory = 'Work' | 'Personal' | 'Shopping';

export type Priority = 'Low' | 'Medium' | 'High';