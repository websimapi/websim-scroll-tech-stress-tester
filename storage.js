const STORAGE_KEY = 'scroll_bug_tester_logs';

export const Storage = {
    getLogs() {
        try {
            const logs = localStorage.getItem(STORAGE_KEY);
            return logs ? JSON.parse(logs) : [];
        } catch (e) {
            console.error('Failed to parse logs', e);
            return [];
        }
    },

    saveLogs(logs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to save logs', e);
        }
    },

    clearLogs() {
        localStorage.removeItem(STORAGE_KEY);
    },

    // Start a new test entry
    startTest(testName) {
        const logs = this.getLogs();
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const newEntry = {
            id,
            name: testName,
            status: 'running',
            startTime: Date.now(),
            endTime: null,
            duration: null
        };
        logs.unshift(newEntry); // Add to top
        this.saveLogs(logs);
        return id;
    },

    // Complete a test entry
    completeTest(id, success = true, errorMsg = null) {
        const logs = this.getLogs();
        const entryIndex = logs.findIndex(l => l.id === id);

        if (entryIndex !== -1) {
            const entry = logs[entryIndex];
            entry.endTime = Date.now();
            entry.duration = entry.endTime - entry.startTime;
            entry.status = success ? 'completed' : 'failed';
            entry.error = errorMsg;

            this.saveLogs(logs);
        }
    },

    // Scan for logs that are stuck in 'running' state from previous sessions
    detectCrashes() {
        const logs = this.getLogs();
        let changed = false;

        logs.forEach(log => {
            if (log.status === 'running') {
                log.status = 'crashed';
                log.error = 'Page reloaded or crashed during execution';
                changed = true;
            }
        });

        if (changed) {
            this.saveLogs(logs);
        }
        return logs;
    }
};