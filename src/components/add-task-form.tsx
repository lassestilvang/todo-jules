'use client';

import React, { useState } from 'react';

interface AddTaskFormProps {
  onTaskAdded: () => void;
}

const AddTaskForm = ({ onTaskAdded }: AddTaskFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('None');
  const [listId, setListId] = useState(1); // Default to Inbox

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ name, description, date, deadline, priority, listId }),
    });

    // Reset form and refresh tasks
    setName('');
    setDescription('');
    setDate('');
    setDeadline('');
    setPriority('None');
    onTaskAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h3 className="text-lg font-bold mb-2">Add New Task</h3>
      <div className="mb-2">
        <label htmlFor="task-name" className="block text-sm font-medium">
          Task Name
        </label>
        <input
          type="text"
          id="task-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          required
        />
      </div>
      <div className="mb-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="deadline" className="block text-sm font-medium">
          Deadline
        </label>
        <input
          type="date"
          id="deadline"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="priority" className="block text-sm font-medium">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option>None</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
      >
        Add Task
      </button>
    </form>
  );
};

export default AddTaskForm;
