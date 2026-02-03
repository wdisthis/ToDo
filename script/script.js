    const activeList = document.getElementById('active-list');
    const completedList = document.getElementById('completed-list');
    const taskInput = document.getElementById('task-input');
    const subjectInput = document.getElementById('subject-input');
    const deadlineInput = document.getElementById('deadline-input');
    const priorityInput = document.getElementById('priority-input');
    const subjectHistoryDiv = document.getElementById('subject-history');
    const progressText = document.getElementById('progress-text');
    const dateDisplay = document.getElementById('current-date');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let savedSubjects = JSON.parse(localStorage.getItem('subjects')) || [];

    // Format: "Tuesday, 3 February 2026"
    function updateRealtimeDate() {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateDisplay.innerText = new Date().toLocaleDateString('en-GB', options);
    }

    function toggleForm(show) {
        document.getElementById('input-overlay').style.display = show ? 'flex' : 'none';
        if (show) { renderSubjectHistory(); taskInput.focus(); }
    }

    function renderSubjectHistory() {
        subjectHistoryDiv.innerHTML = '';
        savedSubjects.forEach(sub => {
            const chip = document.createElement('div');
            chip.className = 'history-chip';
            chip.innerHTML = `<span onclick="selectSubject('${sub}')">${sub}</span><span class="delete-chip" onclick="deleteSubject('${sub}')">×</span>`;
            subjectHistoryDiv.appendChild(chip);
        });
    }

    function selectSubject(val) { subjectInput.value = val; }
    function deleteSubject(val) {
        savedSubjects = savedSubjects.filter(s => s !== val);
        localStorage.setItem('subjects', JSON.stringify(savedSubjects));
        renderSubjectHistory();
    }

    function saveAndRender() {
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        activeList.innerHTML = '';
        completedList.innerHTML = '';

        let activeCount = 0;
        let completedCount = 0;

        tasks.forEach((task, index) => {
            const li = document.createElement('div');
            li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
            
            // Format: "3 February 2026"
            const formattedDate = new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

            li.innerHTML = `
                <div class="task-info">
                    <h4>${task.name}</h4>
                    <span class="subject-badge">${task.subject}</span>
                    <span class="deadline-text">Due: ${formattedDate}</span>
                </div>
                <div class="actions">
                    <button class="btn-check" onclick="toggleTask(${index})">${task.completed ? '↩' : 'V'}</button>
                    <button class="btn-del" onclick="deleteTask(${index})">X</button>
                </div>
            `;

            if (task.completed) {
                completedList.appendChild(li);
                completedCount++;
            } else {
                activeList.appendChild(li);
                activeCount++;
            }
        });

        document.getElementById('active-section').style.display = activeCount > 0 ? 'block' : 'none';
        document.getElementById('completed-section').style.display = completedCount > 0 ? 'block' : 'none';
        
        if (activeCount === 0 && completedCount === 0) {
            activeList.innerHTML = `<p style="text-align:center; color:#999; margin-top:50px;">No tasks available.</p>`;
            document.getElementById('active-section').style.display = 'block';
        }

        progressText.innerText = `${completedCount}/${tasks.length} Tasks Completed`;
    }

    function addTask() {
        const subVal = subjectInput.value.trim().toUpperCase();
        if (!taskInput.value || !deadlineInput.value) return alert("Please fill in all fields!");

        tasks.push({
            name: taskInput.value,
            subject: subVal || 'GENERAL',
            deadline: deadlineInput.value,
            priority: priorityInput.value,
            completed: false
        });

        if (subVal && !savedSubjects.includes(subVal)) {
            savedSubjects.push(subVal);
            localStorage.setItem('subjects', JSON.stringify(savedSubjects));
        }

        taskInput.value = ''; subjectInput.value = ''; deadlineInput.value = '';
        toggleForm(false);
        saveAndRender();
    }

    function toggleTask(index) { tasks[index].completed = !tasks[index].completed; saveAndRender(); }
    function deleteTask(index) { if(confirm("Delete this task?")) { tasks.splice(index, 1); saveAndRender(); } }

    document.getElementById('open-form-btn').addEventListener('click', () => toggleForm(true));
    document.getElementById('cancel-btn').addEventListener('click', () => toggleForm(false));
    document.getElementById('add-btn').addEventListener('click', addTask);
    
    window.onclick = (e) => { if(e.target.id == 'input-overlay') toggleForm(false); }
    window.onload = () => { updateRealtimeDate(); renderTasks(); };