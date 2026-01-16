export type Subtask = {
  id: number;
  name: string;
  completed: boolean;
};

export type Label = {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
};

export type TaskLabel = {
  label: Label;
};

export type Reminder = {
  id: number;
  remindAt: string;
};

export type Attachment = {
  id: number;
  url: string;
};

export type Task = {
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
};
