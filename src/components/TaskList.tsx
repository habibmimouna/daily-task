import React from 'react';
import {
    IonItem,
    IonLabel,
    IonList,
    IonCheckbox,
    IonIcon,
    IonBadge,
    IonButton,
    IonChip,
} from '@ionic/react';
import { trash, personAddOutline, checkmarkCircle } from 'ionicons/icons';
import { Task } from '../types/task';

interface TaskListProps {
    tasks: Task[];
    onTaskComplete: (taskId: string) => void;
    onTaskDelete: (taskId: string) => void;
    onAddHelper: (taskId: string) => void;
    isDeleteMode: boolean;
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'High':
            return 'danger';
        case 'Medium':
            return 'warning';
        case 'Low':
            return 'success';
        default:
            return 'medium';
    }
};

const TaskList: React.FC<TaskListProps> = ({ 
    tasks, 
    onTaskComplete, 
    onTaskDelete, 
    onAddHelper,
    isDeleteMode
}) => {
    return (
        <IonList>
            {tasks.map((task) => (
                <IonItem key={task.id}>
                    {/* Completion Checkbox */}
                    <IonCheckbox
                        slot="start"
                        style={{
                            '--size': '24px',
                            '--checkbox-background-checked': 'var(--ion-color-success)',
                        }}
                        checked={task.completed}
                        onIonChange={() => onTaskComplete(task.id)}
                    />

                    <IonLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? 'var(--ion-color-medium)' : 'inherit'
                            }}>
                                {task.title}
                            </h2>
                            {task.completed && (
                                <IonChip color="success" style={{ margin: '0' }}>
                                    <IonIcon icon={checkmarkCircle} />
                                    <IonLabel>Completed</IonLabel>
                                </IonChip>
                            )}
                        </div>
                        <p style={{ marginTop: '4px' }}>
                            {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    </IonLabel>

                    <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonBadge color={getPriorityColor(task.priority)}>
                            {task.priority}
                        </IonBadge>
                        
                        {!isDeleteMode && (
                            <IonButton
                                fill="clear"
                                onClick={() => onAddHelper(task.id)}
                                disabled={task.completed}
                            >
                                <IonIcon slot="icon-only" icon={personAddOutline} />
                            </IonButton>
                        )}
                        
                        {isDeleteMode && (
                            <IonButton
                                fill="clear"
                                color="danger"
                                onClick={() => onTaskDelete(task.id)}
                            >
                                <IonIcon slot="icon-only" icon={trash} />
                            </IonButton>
                        )}
                    </div>
                </IonItem>
            ))}
            {tasks.length === 0 && (
                <IonItem>
                    <IonLabel className="ion-text-center">
                        <p>No tasks found</p>
                    </IonLabel>
                </IonItem>
            )}
        </IonList>
    );
};

export default TaskList;