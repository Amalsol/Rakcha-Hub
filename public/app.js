document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen'), workspaceContainer = document.getElementById('workspace-container'), loginBtn = document.getElementById('login-btn'), usernameInput = document.getElementById('username-input'), logoutBtn = document.getElementById('logout-btn'), welcomeMessage = document.getElementById('welcome-message'), addNodeBtn = document.getElementById('add-node-btn'), canvasArea = document.querySelector('.canvas-area'), canvas = document.getElementById('canvas'), searchInput = document.getElementById('search-input'), progressDonut = document.getElementById('progress-donut'), donutPercent = document.getElementById('donut-percent'), progressBarsContainer = document.getElementById('progress-bars'), jamSessionBtn = document.getElementById('jam-session-btn'), whiteboardContainer = document.getElementById('whiteboard-container'), exitJamBtn = document.getElementById('exit-jam-btn'), whiteboardCanvas = document.getElementById('whiteboard-canvas'), colorPicker = document.getElementById('color-picker'), brushSize = document.getElementById('brush-size'), eraserBtn = document.getElementById('eraser-btn'), clearCanvasBtn = document.getElementById('clear-canvas-btn'), focusOverlay = document.getElementById('focus-overlay'), focusPhase = document.getElementById('focus-phase'), focusTitle = document.getElementById('focus-title'), focusTimerDisplay = document.getElementById('focus-timer'), exitFocusBtn = document.getElementById('exit-focus-btn');
    
    // NOTE: genreSelect is now declared inside showWorkspace where it can be found.
    
    let userNodes = [], focusTimerInterval = null, isDrawing = false;
    const whiteboardCtx = whiteboardCanvas.getContext('2d');

    // --- YouTube Player Logic with Genres ---
    const GENRES = [
        { name: "Lofi Hip Hop", videoId: "jfKfPfyJRdk" },
        { name: "Cozy Jazz", videoId: "9-vC9C_sD_Q" },
        { name: "Classical Focus", videoId: "hHW1oY2T528" },
        { name: "Ambient Relaxation", videoId: "lFcOa_hC_T4" }
    ];

    function populateGenreSelector(genreSelect) {
        genreSelect.innerHTML = ''; // Clear previous options
        GENRES.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.videoId;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    }

    function loadYouTubePlayer(videoId) {
        const container = document.getElementById('youtube-player-container');
        container.innerHTML = `
            <iframe 
                width="100%" 
                height="150" 
                src="https://www.youtube.com/embed/${videoId}" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    }

    // --- API HELPER FUNCTIONS (No changes) ---
    const api = { login: async (username) => (await fetch('/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ username }) })).json(), logout: async () => (await fetch('/api/logout', { method: 'POST' })).json(), checkUser: async () => { try { const res = await fetch('/api/user'); return res.ok ? await res.json() : null; } catch (err) { return null; } }, getNodes: async () => (await fetch('/api/nodes')).json(), createNode: async (node) => (await fetch('/api/nodes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(node) })).json(), updateNode: async (id, updates) => (await fetch(`/api/nodes/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(updates) })).json(), deleteNode: async (id) => (await fetch(`/api/nodes/${id}`, { method: 'DELETE' })).json(), };

    // --- USER FLOW (Updated to initialize the genre player) ---
    async function handleLogin() { const username = usernameInput.value.trim(); if (username) { await api.login(username); await showWorkspace(username); } }
    async function handleLogout() { await api.logout(); location.reload(); }
    function showLoginScreen() { workspaceContainer.style.display = 'none'; loginScreen.style.display = 'flex'; }
    async function showWorkspace(username) {
        loginScreen.style.display = 'none';
        workspaceContainer.style.display = 'grid';
        welcomeMessage.textContent = `${username.charAt(0).toUpperCase() + username.slice(1)}'s Hub`;
        
        // **FIX IS HERE**: Get the genreSelect element AFTER the workspace is visible
        const genreSelect = document.getElementById('genre-select');
        genreSelect.addEventListener('change', (e) => {
            loadYouTubePlayer(e.target.value);
        });

        userNodes = await api.getNodes();
        renderAll();
        
        populateGenreSelector(genreSelect);
        if (GENRES.length > 0) {
            loadYouTubePlayer(GENRES[0].videoId); // Load the first genre by default
        }
        
        canvasArea.scrollTop = (canvas.offsetHeight - canvasArea.clientHeight) / 2;
        canvasArea.scrollLeft = (canvas.offsetWidth - canvasArea.clientWidth) / 2;
    }

    // --- RENDER FUNCTIONS (No changes) ---
    const renderAll = () => { renderCanvas(); renderProgressVisuals(); };
    function renderCanvas() {
        canvas.innerHTML = ''; const searchTerm = searchInput.value.toLowerCase();
        const filteredNodes = userNodes.filter(node => !searchTerm || node.title.toLowerCase().includes(searchTerm) || (node.tags || '').toLowerCase().includes(searchTerm));
        filteredNodes.forEach(node => {
            const nodeEl = document.createElement('div'); nodeEl.className = `node ${node.completed ? 'completed' : ''}`;
            nodeEl.setAttribute('data-id', node.id); nodeEl.style.left = `${node.x}px`; nodeEl.style.top = `${node.y}px`;
            nodeEl.innerHTML = `<div class="node-header"><input type="checkbox" class="complete-checkbox" ${node.completed ? 'checked' : ''}><span class="priority-dot ${node.priority}"></span><input class="node-title" value="${node.title}"></div><div class="node-content"><textarea class="node-content-area">${node.content}</textarea></div><div class="node-footer"><input class="node-tags" value="${node.tags || ''}"><div class="node-actions"><button class="focus-btn">&#x25A1;</button><button class="delete-btn">&#x1F5D1;</button></div></div>`;
            canvas.appendChild(nodeEl); makeDraggable(nodeEl);
        });
    }
    function renderProgressVisuals() {
        const total = userNodes.length, completed = userNodes.filter(n => n.completed).length;
        if (total === 0) { progressDonut.style.setProperty('--progress-percent', '0'); donutPercent.textContent = `0%`; progressBarsContainer.innerHTML = `<p>Add nodes to see progress.</p>`; return; }
        const overallPercent = Math.round((completed / total) * 100);
        progressDonut.style.setProperty('--progress-percent', overallPercent); donutPercent.textContent = `${overallPercent}%`;
        progressBarsContainer.innerHTML = '';
        ['high', 'medium', 'low'].forEach(p => {
            const pNodes = userNodes.filter(n => n.priority === p);
            if (pNodes.length === 0) return;
            const pCompleted = pNodes.filter(n => n.completed).length, pPercent = Math.round((pCompleted / pNodes.length) * 100);
            const barGroup = document.createElement('div'); barGroup.className = 'progress-bar-group';
            barGroup.innerHTML = `<div class="progress-bar-label"><span>${p.charAt(0).toUpperCase() + p.slice(1)}</span><span>${pCompleted}/${pNodes.length}</span></div><div class="progress-bar-outer"><div class="progress-bar-inner ${p}" style="width: ${pPercent}%"></div></div>`;
            progressBarsContainer.appendChild(barGroup);
        });
    }

    // --- NODE FUNCTIONALITY (No changes) ---
    async function addNode() { const newNodeData = { id: Date.now(), title: "New Node", content: "Details...", tags: "#new", priority: "medium", completed: false, x: 50 + canvasArea.scrollLeft, y: 50 + canvasArea.scrollTop }; const createdNode = await api.createNode(newNodeData); userNodes.push(createdNode); renderAll(); }
    function makeDraggable(el) { let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; const header = el.querySelector(".node-header"); header.onmousedown = (e) => { if (e.target.tagName === 'INPUT') return; e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = async () => { document.onmouseup = null; document.onmousemove = null; const nodeId = parseInt(el.getAttribute('data-id')), updates = { x: el.offsetLeft, y: el.offsetTop }; await api.updateNode(nodeId, updates); const localNode = userNodes.find(n => n.id === nodeId); if (localNode) { localNode.x = updates.x; localNode.y = updates.y; } }; document.onmousemove = (e) => { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; el.style.top = `${el.offsetTop - pos2}px`; el.style.left = `${el.offsetLeft - pos1}px`; }; }; }
    const debounce = (func, timeout = 500) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => { func.apply(this, args); }, timeout); }; };
    const saveNodeUpdate = debounce(async (nodeId, updates) => { await api.updateNode(nodeId, updates); const nodeIndex = userNodes.findIndex(n => n.id === nodeId); if (nodeIndex !== -1) Object.assign(userNodes[nodeIndex], updates); if ('completed' in updates) renderProgressVisuals(); });
    
    // --- POMODORO & WHITEBOARD (No changes) ---
    function startFocusCycle(node) { focusOverlay.style.display = 'flex'; focusTitle.textContent = node.title; runTimer(25 * 60, "Focusing", () => { alert("Focus complete! Time for a break."); runTimer(5 * 60, "Break Time", () => { alert("Break's over!"); closeFocusCycle(); }); }); }
    function runTimer(duration, phaseText, onComplete) { let timeLeft = duration; clearInterval(focusTimerInterval); focusTimerInterval = setInterval(() => { const minutes = Math.floor(timeLeft / 60), seconds = timeLeft % 60; focusTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; if (timeLeft <= 0) { clearInterval(focusTimerInterval); onComplete(); } timeLeft--; }, 1000); }
    function closeFocusCycle() { clearInterval(focusTimerInterval); focusOverlay.style.display = 'none'; }
    function initWhiteboard() { whiteboardCanvas.width = window.innerWidth; whiteboardCanvas.height = window.innerHeight; whiteboardCtx.lineCap = 'round'; whiteboardCtx.lineJoin = 'round'; whiteboardCtx.strokeStyle = colorPicker.value; whiteboardCtx.lineWidth = brushSize.value; }
    const startDrawing = (e) => { isDrawing = true; whiteboardCtx.beginPath(); whiteboardCtx.moveTo(e.offsetX, e.offsetY); }, draw = (e) => { if (!isDrawing) return; whiteboardCtx.lineTo(e.offsetX, e.offsetY); whiteboardCtx.stroke(); }, stopDrawing = () => { isDrawing = false; whiteboardCtx.closePath(); };
    
    // --- EVENT LISTENERS ---
    loginBtn.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keyup', e => { if (e.key === 'Enter') handleLogin(); });
    logoutBtn.addEventListener('click', handleLogout);
    addNodeBtn.addEventListener('click', addNode);
    searchInput.addEventListener('input', renderAll);
    exitFocusBtn.addEventListener('click', closeFocusCycle);
    
    canvas.addEventListener('input', e => { const nodeEl = e.target.closest('.node'); if (!nodeEl) return; const nodeId = parseInt(nodeEl.getAttribute('data-id')); let updates = {}; if (e.target.classList.contains('node-title')) updates.title = e.target.value; if (e.target.classList.contains('node-content-area')) updates.content = e.target.value; if (e.target.classList.contains('node-tags')) updates.tags = e.target.value; if (e.target.classList.contains('complete-checkbox')) { updates.completed = e.target.checked; const localNode = userNodes.find(n => n.id === nodeId); if (localNode) localNode.completed = updates.completed; renderAll(); } saveNodeUpdate(nodeId, updates); });
    canvas.addEventListener('click', async e => { const nodeEl = e.target.closest('.node'); if (!nodeEl) return; const nodeId = parseInt(nodeEl.getAttribute('data-id')); const node = userNodes.find(n => n.id === nodeId); if (e.target.closest('.delete-btn')) { if (confirm('Delete this node?')) { await api.deleteNode(nodeId); userNodes = userNodes.filter(n => n.id !== nodeId); renderAll(); } } else if (e.target.closest('.focus-btn')) { startFocusCycle(node); } });
    jamSessionBtn.addEventListener('click', () => { whiteboardContainer.style.display = 'block'; initWhiteboard(); });
    exitJamBtn.addEventListener('click', () => { whiteboardContainer.style.display = 'none'; });
    colorPicker.addEventListener('change', e => { whiteboardCtx.strokeStyle = e.target.value; });
    eraserBtn.addEventListener('click', () => { whiteboardCtx.strokeStyle = getComputedStyle(whiteboardContainer).getPropertyValue('--canvas-bg'); });
    brushSize.addEventListener('input', e => { whiteboardCtx.lineWidth = e.target.value; });
    clearCanvasBtn.addEventListener('click', () => { if (confirm('Clear the canvas?')) whiteboardCtx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height); });
    whiteboardCanvas.addEventListener('mousedown', startDrawing); whiteboardCanvas.addEventListener('mousemove', draw); whiteboardCanvas.addEventListener('mouseup', stopDrawing); whiteboardCanvas.addEventListener('mouseout', stopDrawing);

    // --- INITIALIZATION ---
    async function init() { const user = await api.checkUser(); if (user) await showWorkspace(user.username); else showLoginScreen(); }
    init();
});