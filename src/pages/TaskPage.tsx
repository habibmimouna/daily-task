import React, { useEffect, useState } from 'react';
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonList,
    IonItem,
    IonLabel,
    IonLoading,
    useIonToast,
    IonAlert,
} from '@ionic/react';
import { useParams } from 'react-router';
import { add, trash } from 'ionicons/icons';
import TaskList from '../components/TaskList';
import { Task, Priority, TaskCategory } from '../types/task';
import { firestoreService } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import TaskHelperModal from '../components/TaskHelperModal';

const TaskPage: React.FC = () => {
    const { category } = useParams<{ category: TaskCategory }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isHelperModalOpen, setIsHelperModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const { currentUser } = useAuth();
    const [newTask, setNewTask] = useState({
        title: '',
        priority: 'Medium' as Priority
    });
    const [present] = useIonToast();

    useEffect(() => {
        const loadTasks = async () => {
            if (currentUser) {
                try {
                    const loadedTasks = await firestoreService.getTasks(currentUser.uid, category);
                    setTasks(loadedTasks);
                } catch (error) {
                    console.error('Error loading tasks:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadTasks();
    }, [category, currentUser]);

    const handleAddTask = async () => {
        if (newTask.title.trim() && currentUser) {
            try {
                const taskId = await firestoreService.createTask({
                    title: newTask.title,
                    category: category,
                    priority: newTask.priority,
                    completed: false,
                    createdAt: new Date()
                }, currentUser.uid);

                const updatedTasks = await firestoreService.getTasks(currentUser.uid, category);
                setTasks(updatedTasks);
                setNewTask({ title: '', priority: 'Medium' });
                setIsModalOpen(false);
                present({
                    message: 'Added task.',
                    duration: 3000,
                    color: 'success'
                });
            } catch (error) {
                console.error('Error adding task:', error);
                present({
                    message: 'Failed to add task.',
                    duration: 3000,
                    color: 'danger'
                });
            }
        }
    };

    const handleTaskComplete = async (taskId: string) => {
        try {
            const isCompleting = !tasks.find(t => t.id === taskId)?.completed;
            await firestoreService.updateTaskStatus(taskId, isCompleting);

            if (currentUser) {
                const updatedTasks = await firestoreService.getTasks(currentUser.uid, category);
                setTasks(updatedTasks);
            }

            present({
                message: isCompleting ? 'Task completed!' : 'Task reopened',
                duration: 2000,
                color: isCompleting ? 'success' : 'primary'
            });
        } catch (error) {
            console.error('Error updating task:', error);
            present({
                message: 'Failed to update task status',
                duration: 3000,
                color: 'danger'
            });
        }
    };

    const confirmDelete = (taskId: string) => {
        setTaskToDelete(taskId);
        setShowDeleteAlert(true);
    };

    const handleTaskDelete = async () => {
        if (!taskToDelete) return;

        try {
            setLoading(true);
            await firestoreService.deleteTask(taskToDelete);

            if (currentUser) {
                const updatedTasks = await firestoreService.getTasks(currentUser.uid, category);
                setTasks(updatedTasks);
            }

            present({
                message: 'Task deleted successfully',
                duration: 3000,
                color: 'success'
            });
        } catch (error) {
            console.error('Error deleting task:', error);
            present({
                message: 'Failed to delete task',
                duration: 3000,
                color: 'danger'
            });
        } finally {
            setLoading(false);
            setShowDeleteAlert(false);
            setTaskToDelete(null);
        }
    };

    const handleAddHelper = (taskId: string) => {
        setSelectedTaskId(taskId);
        setIsHelperModalOpen(true);
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        if (isDeleteMode) {
            present({
                message: 'Delete mode disabled',
                duration: 2000,
                color: 'medium'
            });
        } else {
            present({
                message: 'Delete mode enabled',
                duration: 2000,
                color: 'warning'
            });
        }
    };

    return (
        <IonPage>
            <div className="safe-area-top">
                <IonHeader className="ion-no-border">
                    <IonToolbar style={{
                        '--min-height': 'calc(env(safe-area-inset-top) + 56px)',
                        '--padding-top': 'env(safe-area-inset-top)'
                    }}>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>{category} Tasks</IonTitle>
                        <IonButtons slot="end">
                            <IonButton
                                onClick={toggleDeleteMode}
                                color={isDeleteMode ? 'danger' : 'medium'}
                            >
                                <IonIcon slot="icon-only" icon={trash} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
            </div>

            <IonContent>
                <TaskList
                    tasks={tasks.filter(task => task.category === category)}
                    onTaskComplete={handleTaskComplete}
                    onTaskDelete={confirmDelete}
                    onAddHelper={handleAddHelper}
                    isDeleteMode={isDeleteMode}
                />

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => setIsModalOpen(true)}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Add New Task</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        <IonList>
                            <IonItem>
                                <IonLabel position="stacked">Task Title</IonLabel>
                                <IonInput
                                    value={newTask.title}
                                    onIonChange={e => setNewTask({ ...newTask, title: e.detail.value! })}
                                    placeholder="Enter task title"
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel position="stacked">Priority</IonLabel>
                                <IonSelect
                                    value={newTask.priority}
                                    onIonChange={e => setNewTask({ ...newTask, priority: e.detail.value })}
                                >
                                    <IonSelectOption value="Low">Low</IonSelectOption>
                                    <IonSelectOption value="Medium">Medium</IonSelectOption>
                                    <IonSelectOption value="High">High</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonList>
                        <div style={{ padding: '20px' }}>
                            <IonButton expand="block" onClick={handleAddTask}>Add Task</IonButton>
                            <IonButton expand="block" color="medium" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </IonButton>
                        </div>
                    </IonContent>
                </IonModal>

                <TaskHelperModal
                    isOpen={isHelperModalOpen}
                    onClose={() => setIsHelperModalOpen(false)}
                    taskId={selectedTaskId}
                />

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => {
                        setShowDeleteAlert(false);
                        setTaskToDelete(null);
                    }}
                    header="Delete Task"
                    message="Are you sure you want to delete this task?"
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                        },
                        {
                            text: 'Delete',
                            role: 'destructive',
                            handler: handleTaskDelete
                        }
                    ]}
                />

                <IonLoading isOpen={loading} message="Please wait..." />
            </IonContent>
        </IonPage>
    );
};

export default TaskPage;