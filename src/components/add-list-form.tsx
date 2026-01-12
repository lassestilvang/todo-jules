'use client';

import React, { useState } from 'react';

const AddListForm = () => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [emoji, setEmoji] = useState('🎉');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch('/api/lists', {
      method: 'POST',
      body: JSON.stringify({ name, color, emoji }),
    });

    // Reset form and refresh lists (this will be handled by a state management library later)
    setName('');
    setColor('#ffffff');
    setEmoji('🎉');
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h3 className="text-lg font-bold mb-2">Add New List</h3>
      <div className="mb-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          required
        />
      </div>
      <div className="mb-2">
        <label htmlFor="color" className="block text-sm font-medium">
          Color
        </label>
        <input
          type="color"
          id="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
        />
      </div>
      <div className="mb-2">
        <label htmlFor="emoji" className="block text-sm font-medium">
          Emoji
        </label>
        <input
          type="text"
          id="emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="w-full p-2 bg-gray-700 rounded"
          maxLength={2}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
      >
        Add List
      </button>
    </form>
  );
};

export default AddListForm;
