// components/TodoListInput.jsx - Complete Fixed Version

import { Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';

const TodoListInput = ({ todoList, setTodoList }) => {
    const [option, setOption] = useState("");

    const handleAddOption = () => {
        if (option.trim()) {
            // ✅ Store as objects with text and completed status
            setTodoList([...todoList, { text: option.trim(), completed: false }]);
            setOption("");
        }
    };

    const handleDeleteOption = (index) => {
        const updatedArr = todoList.filter((_, idx) => idx !== index);
        setTodoList(updatedArr);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    return (
        <div className="w-full">
            {/* Todo List Items */}
            {todoList.length > 0 ? (
                todoList.map((item, index) => {
                    // ✅ Get the text value safely (handle both string and object)
                    const itemText = typeof item === 'string' ? item : item?.text || '';
                    // ✅ Use index as key since we don't have a unique id
                    const itemKey = `todo-${index}`;
                    
                    return (
                        <div
                            key={itemKey}  // ✅ Use string key with index
                            className="flex justify-between bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3 py-2 rounded-md mb-3 mt-2"
                        >
                            <p className="text-xs text-black dark:text-white">
                                <span className="text-xs text-gray-400 dark:text-slate-500 font-semibold mr-2">
                                    {index < 9 ? `0${index + 1}` : index + 1}
                                </span>
                                {itemText}
                            </p>
                            <button
                                className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded transition-colors"
                                onClick={() => handleDeleteOption(index)}
                                type="button"
                            >
                                <Trash className='text-lg text-red-500' />
                            </button>
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-4 text-sm text-gray-400 dark:text-slate-500">
                    No todo items added yet
                </div>
            )}

            {/* Add Todo Input */}
            <div className="flex items-center gap-3 mt-4">
                <input
                    type="text"
                    placeholder='Enter task...'
                    value={option}
                    onChange={({ target }) => setOption(target.value)}
                    onKeyDown={handleKeyDown}
                    className='flex-1 text-[13px] text-black dark:text-white outline-none bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
                />
                <button
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-1 text-sm font-medium whitespace-nowrap"
                    onClick={handleAddOption}
                    type="button"
                >
                    <Plus className='w-4 h-4' /> Add
                </button>
            </div>
        </div>
    );
};

export default TodoListInput;