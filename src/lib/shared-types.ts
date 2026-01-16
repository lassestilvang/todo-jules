export interface Subtask {
  id: number;
  name: string;
  completed: boolean;
}

export interface Label {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
}

export interface TaskLabel {
  label: Label;
}

export interface Reminder {
  id: number;
  remindAt: string;
}

export interface Attachment {
  id: number;
  url: string;
}

export interface Task {
  id: number;
  name: string;
  description: string | null;
  date: string | null;
  deadline: string | null;
  priority: string | null;
  completed: boolean;
  estimate: number | null;
  actualTime: number | null;
  recurring: string | null;
  subtasks: Subtask[];
  labels: TaskLabel[];
  reminders: Reminder[];
  attachments: Attachment[];
}
