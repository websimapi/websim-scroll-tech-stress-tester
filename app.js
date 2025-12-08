import { Storage } from './storage.js';
import { ScrollTests } from './scrollTests.js';

// DOM Elements
const ui = {
    resultsTable: document.querySelector('#results-table tbody'),
    btnRunAll: document.getElementById('btn-run-all'),
    btnClear: document.getElementById('btn-clear'),
    statusBar: document.getElementById('status-bar'),
    scrollContainer: document.getElementById('scroll-container'),
    testButtons: document.querySelectorAll('.test-controls button')
};

// Utils
function formatDate(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString() + '.' + d.getMilliseconds().toString().padStart(3, '0');
}

function renderTable() {
    const logs = Storage.getLogs();
    ui.resultsTable.innerHTML = '';
    
    logs.forEach(log => {
        const tr = document.createElement('tr');
        
        const durationText = log.duration ? `${log.duration}ms` : (log.error || '-');
        const statusClass = `status-${log.status}`;
        
        tr.innerHTML = `
            <td>${formatDate(log.startTime)}</td>
            <td>${log.name}</td>
            <td class="${statusClass}">${log.status.toUpperCase()}</td>
            <td>${durationText}</td>
        `;
        ui.resultsTable.appendChild(tr);
    });
}

function updateStatus(msg) {
    ui.statusBar.textContent = msg;
}

// Test Runner
async function runTest(testName) {
    // 1. Log start
    const testId = Storage.startTest(testName);
    renderTable(); // Update UI immediately to show running
    updateStatus(`Running ${testName}...`);
    
    try {
        // 2. Find function
        const testFn = ScrollTests[testName];
        if (!testFn) throw new Error(`Test function ${testName} not found`);
        
        // 3. Execute
        await testFn(ui.scrollContainer);
        
        // 4. Log complete
        Storage.completeTest(testId, true);
        updateStatus(`Finished ${testName}`);
    } catch (error) {
        console.error(error);
        Storage.completeTest(testId, false, error.message);
        updateStatus(`Error in ${testName}`);
    } finally {
        renderTable();
    }
}

async function runAllTests() {
    const tests = Object.keys(ScrollTests);
    ui.btnRunAll.disabled = true;
    
    for (const testName of tests) {
        await runTest(testName);
        // Small pause between tests
        await new Promise(r => setTimeout(r, 500));
    }
    
    ui.btnRunAll.disabled = false;
    updateStatus('All tests completed');
}

// Initialization
function init() {
    // Check for crashes from previous session
    const logs = Storage.detectCrashes();
    if (logs.some(l => l.status === 'crashed')) {
        updateStatus(' Crashes detected from previous session');
    }
    
    renderTable();

    // Event Listeners
    ui.btnClear.addEventListener('click', () => {
        Storage.clearLogs();
        renderTable();
        updateStatus('Logs cleared');
    });

    ui.btnRunAll.addEventListener('click', runAllTests);

    ui.testButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const testName = btn.dataset.test;
            if (testName) {
                runTest(testName);
            }
        });
    });
}

// Start
init();