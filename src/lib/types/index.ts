export type Subtask = {
  id: number;
  name: string;
  completed: boolean | null;
};

export type Label = {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
};

export type TaskLabel = {
  label: Label | null;
};

export type Reminder = {
  id: number;
  remindAt: Date;
};

export type Attachment = {
  id: number;
  url: string;
};

export type Task = {
  id: number;
  name: string;
  description: string | null;
  date: Date | null;
  deadline: Date | null;
  priority: string | null;
  completed: boolean | null;
  estimate: number | null;
  actualTime: number | null;
  recurring: string | null;
  subtasks: Subtask[];
  labels: TaskLabel[];
  reminders: Reminder[];
  attachments: Attachment[];
};
