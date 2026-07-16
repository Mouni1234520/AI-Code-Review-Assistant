import React, { useState, useEffect } from "react";
import { FaPlus, FaTrashAlt, FaCheck, FaTasks } from "react-icons/fa";

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("code_review_tasks");
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save to localStorage when tasks change
  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("code_review_tasks", JSON.stringify(newTasks));
    window.dispatchEvent(new Event("tasks_updated"));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask = {
      id: Date.now(),
      text: taskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    saveTasks([newTask, ...tasks]);
    setTaskText("");
  };

  const toggleTaskCompletion = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const filtered = tasks.filter(t => t.id !== id);
    saveTasks(filtered);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div className="page-header">
        <h1>Task Manager</h1>
        <p>Keep track of refactoring tasks, bug fixes, and development checklists.</p>
      </div>

      <div className="tasks-container">
        {/* Left Card: Add Task & Progress */}
        <div className="card-panel">
          <div className="panel-title" style={{ fontSize: "16px", marginBottom: "15px" }}>
            <FaTasks /> Tasks Summary
          </div>
          
          <div className="task-progress" style={{ margin: "20px 0" }}>
            <div className="progress-header" style={{ fontWeight: 600 }}>
              <span>Completion Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: "8px", margin: "10px 0" }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px", fontSize: "13px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--success)" }}>{completedTasks}</span>
                <p style={{ color: "var(--text-secondary)" }}>Completed</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--warning)" }}>{remainingTasks}</span>
                <p style={{ color: "var(--text-secondary)" }}>Remaining</p>
              </div>
            </div>
          </div>

          <hr style={{ border: "0.5px solid var(--border-color)", margin: "20px 0" }} />

          <form onSubmit={handleAddTask} className="task-form">
            <h4 style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "8px" }}>Create New Task</h4>
            <input
              type="text"
              className="task-input"
              placeholder="e.g., Fix SQL injection on line 42..."
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              required
            />
            <button type="submit" className="btn-save" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
              <FaPlus /> Add Task
            </button>
          </form>
        </div>

        {/* Right Card: Task List */}
        <div className="card-panel">
          <div className="panel-title" style={{ fontSize: "16px", marginBottom: "15px" }}>
            📋 Task Checklist ({totalTasks})
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              No tasks created yet. Use the sidebar panel to add your first checklist item!
            </div>
          ) : (
            <div className="task-list">
              {tasks.map(t => (
                <div key={t.id} className={`task-item ${t.completed ? "completed" : ""} ${t.rectified ? "rectified" : ""}`}>
                  <div className="task-item-left" onClick={() => toggleTaskCompletion(t.id)}>
                    <div className="task-checkbox-wrapper">
                      <div className="task-checkbox" style={{
                        backgroundColor: t.rectified ? "var(--success)" : undefined,
                        borderColor: t.rectified ? "var(--success)" : undefined,
                      }}>
                        {(t.completed || t.rectified) && <FaCheck style={{ fontSize: "10px", color: "#fff" }} />}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                        {t.file && (
                          <span className="task-file-badge" style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-secondary)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontFamily: "monospace"
                          }}>
                            {t.file}
                          </span>
                        )}
                        {t.rectified && (
                          <span className="task-rectified-badge" style={{
                            background: "rgba(16, 185, 129, 0.1)",
                            border: "1px solid var(--success)",
                            color: "var(--success)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            ✓ Rectified
                          </span>
                        )}
                      </div>
                      <span className="task-title" style={{
                        textDecoration: (t.completed || t.rectified) ? "line-through" : "none",
                        color: (t.completed || t.rectified) ? "var(--text-muted)" : "var(--text-primary)"
                      }}>{t.text}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="btn-delete-task" 
                    onClick={() => handleDeleteTask(t.id)}
                    title="Delete task"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TasksPage;
