import React, { useState, useEffect } from 'react';
import './styles.css'; 

const ExpenseTracker = () => {
  const [budget, setBudget] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: 0, date: '' });
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('');
  const [editIndex, setEditIndex] = useState(null); // For editing an expense

  // Load data from localStorage when the component is mounted
  useEffect(() => {
    const savedBudget = localStorage.getItem('budget');
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    if (savedBudget) {
      setBudget(Number(savedBudget));
      setRemainingBudget(Number(savedBudget) - savedExpenses.reduce((acc, expense) => acc + expense.amount, 0));
    }
    setExpenses(savedExpenses);
  }, []);

  useEffect(() => {
    calculateRemainingBudget();
  }, [expenses]);

  const handleBudgetChange = (e) => {
    const value = Number(e.target.value);
    setBudget(value);
    setRemainingBudget(value);
    localStorage.setItem('budget', value); // Save budget to localStorage
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const addExpense = () => {
    if (newExpense.category && newExpense.amount > 0 && newExpense.date) {
      const updatedExpenses = editIndex !== null
        ? expenses.map((expense, index) => index === editIndex ? newExpense : expense)
        : [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses)); // Save expenses to localStorage
      setNewExpense({ category: '', amount: 0, date: '' });
      setEditIndex(null); // Reset edit mode
    } else {
      alert('Please fill in all fields correctly.');
    }
  };

  const deleteExpense = (index) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses)); // Save updated expenses to localStorage
    }
  };

  const calculateRemainingBudget = () => {
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    setRemainingBudget(budget - totalExpenses);

    if (totalExpenses >= budget * 0.8) {
      alert('80% of the budget has been utilized');
    }
  };

  const handleSort = (criteria) => {
    setSortBy(criteria);
    let sortedExpenses = [...expenses];
    if (criteria === 'amount') {
      sortedExpenses.sort((a, b) => a.amount - b.amount);
    } else if (criteria === 'category') {
      sortedExpenses.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      sortedExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    setExpenses(sortedExpenses);
  };

  const handleFilterCategoryChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const clearAllExpenses = () => {
    if (window.confirm('Are you sure you want to clear all expenses?')) {
      setExpenses([]);
      setRemainingBudget(budget);
      localStorage.setItem('expenses', JSON.stringify([])); // Clear expenses in localStorage
    }
  };

  return (
    <div className="expense-tracker">
      <h1>Expense Tracker</h1>

      <div className="budget-section">
        <h2>Set Monthly Budget</h2>
        <input
          type="number"
          value={budget}
          onChange={handleBudgetChange}
          placeholder="Enter Budget"
          className="input-field"
        />
        <button onClick={() => setRemainingBudget(budget)} className="button">Set Budget</button>
      </div>

      <div className="expense-section">
        <h2>{editIndex !== null ? 'Edit Expense' : 'Add Expense'}</h2>
        <div>
          <select name="category" value={newExpense.category} onChange={handleExpenseChange} className="input-field">
            <option value="">Select category</option>
            <option value="utilities">Utilities</option>
            <option value="groceries">Groceries</option>
            <option value="entertainment">Entertainment</option>
          </select>
          <input
            type="number"
            name="amount"
            value={newExpense.amount}
            onChange={handleExpenseChange}
            placeholder="Enter amount"
            className="input-field"
          />
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleExpenseChange}
            className="input-field"
          />
          <button onClick={addExpense} className="button">{editIndex !== null ? 'Update Expense' : 'Add Expense'}</button>
        </div>
      </div>

      <div className="overview-section">
        <h2>Expenses Overview</h2>
        <p>Total Expenses: ${expenses.reduce((acc, expense) => acc + expense.amount, 0).toFixed(2)}</p>
        <p>Remaining Budget: ${remainingBudget.toFixed(2)}</p>
        {remainingBudget < 0 && <p className="warning">Warning: Budget exceeded!</p>}
      </div>

      <div className="expense-list">
        <h2>Expense List</h2>
        <div>
          <label>Sort by</label>
          <select onChange={(e) => handleSort(e.target.value)} value={sortBy} className="input-field">
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div>
          <label>Filter by Category</label>
          <select onChange={handleFilterCategoryChange} value={filterCategory} className="input-field">
            <option value="">All</option>
            <option value="utilities">Utilities</option>
            <option value="groceries">Groceries</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>

        <ul>
          {expenses
            .filter((expense) => !filterCategory || expense.category === filterCategory)
            .map((expense, index) => (
              <li key={index} className="expense-item">
                <p><strong>Category:</strong> {expense.category}</p>
                <p><strong>Amount:</strong> ${expense.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> {expense.date}</p>
                <button className="edit-button" onClick={() => { setNewExpense(expense); setEditIndex(index); }}>Edit</button>
                <button className="delete-button" onClick={() => deleteExpense(index)}>Delete</button>
              </li>
            ))}
        </ul>
      </div>

      <button onClick={clearAllExpenses} className="clear-button">Clear All Expenses</button>
    </div>
  );
};

export default ExpenseTracker;