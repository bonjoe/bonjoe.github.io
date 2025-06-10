// Interactive Chart Component
class InteractiveChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.data = [];
        this.charts = {};
        this.currentTimeIndex = 0;
        this.timeSlider = null;
        this.isPlaying = false;
        this.playInterval = null;
        
        this.initializeContainer();
        this.loadData();
    }
    
    initializeContainer() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-controls">
                    <div class="time-info">
                        <h3 id="current-time">Performance of the RL Controller</h3>
                        <p id="time-display">Time: 2018-01-01 00:00:00</p>
                    </div>
                    <div class="control-panel">
                        <div class="slider-container">
                            <label for="time-slider">Time Control:</label>
                            <input type="range" id="time-slider" min="0" max="100" value="0" class="time-slider">
                            <div class="slider-labels">
                                <span>Jan 2019</span>
                            </div>
                        </div>
                        <div class="play-controls">
                            <button id="play-btn" class="control-btn">▶️ Play</button>
                            <button id="reset-btn" class="control-btn">🔄 Reset</button>
                        </div>
                    </div>
                </div>
                <div class="charts-grid">
                    <div class="chart-item">
                        <h4>Speed (rpm)</h4>
                        <div class="chart-wrapper">
                            <canvas id="speed-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-item">
                        <h4>Power (W)</h4>
                        <div class="chart-wrapper">
                            <canvas id="power-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-item">
                        <h4>SOC (%)</h4>
                        <div class="chart-wrapper">
                            <canvas id="soc-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-item">
                        <h4>Reward (-)</h4>
                        <div class="chart-wrapper">
                            <canvas id="reward-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Bind events
        this.timeSlider = document.getElementById('time-slider');
        this.timeSlider.addEventListener('input', (e) => this.onTimeChange(e));
        
        document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetTime());
    }
    
    async loadData() {
        try {
            const response = await fetch('./static/data/chart_data_full.json');
            this.data = await response.json();
            this.timeSlider.max = this.data.length - 1;
            this.initializeCharts();
            this.updateCharts();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }
    
    initializeCharts() {
        // Speed Chart
        const speedCtx = document.getElementById('speed-chart').getContext('2d');
        this.charts.speed = new Chart(speedCtx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'Oil Press Speed',
                    data: [],
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    tension: 0.1,
                    lineWidth: 2
                }]
            },
            options: this.getChartOptions('Speed (rpm)', 0, 80)
        });

        // Power Chart
        const powerCtx = document.getElementById('power-chart').getContext('2d');
        this.charts.power = new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [
                    {
                        label: 'PV Power',
                        data: [],
                        borderColor: '#e67e22',
                        backgroundColor: 'rgba(230, 126, 34, 0.1)',
                        tension: 0.1,
                        lineWidth: 2
                    },
                    {
                        label: 'Press Power',
                        data: [],
                        borderColor: '#2c3e50',
                        backgroundColor: 'rgba(44, 62, 80, 0.1)',
                        tension: 0.1,
                        lineWidth: 2
                    }
                ]
            },
            options: this.getChartOptions('Power (W)', 0, 1200)
        });

        // SOC Chart
        const socCtx = document.getElementById('soc-chart').getContext('2d');
        this.charts.soc = new Chart(socCtx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'State of Charge',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.1,
                    lineWidth: 2
                }]
            },
            options: this.getChartOptions('SOC (%)', 0, 100)
        });

        // Reward Chart
        const rewardCtx = document.getElementById('reward-chart').getContext('2d');
        this.charts.reward = new Chart(rewardCtx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(),
                datasets: [{
                    label: 'RL Reward',
                    data: [],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.1,
                    lineWidth: 2
                }]
            },
            options: this.getChartOptions('Reward (-)', -2, 3)
        });
    }
    
    getChartOptions(yAxisTitle, minY, maxY) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        maxTicksLimit: 12,
                        callback: function(value, index, values) {
                            // Show every 2nd tick (every 2 hours)
                            return index % 2 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: yAxisTitle
                    },
                    min: minY,
                    max: maxY,
                    grid: {
                        display: true,
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            animation: {
                duration: 0
            }
        };
    }
    
    generateTimeLabels() {
        const windowSize = 24; // Show 24 hours of data
        return Array.from({length: windowSize}, (_, i) => `${i}h`);
    }
    
    updateCharts() {
        if (!this.charts.speed || this.data.length === 0) return;
        
        const currentIndex = parseInt(this.timeSlider.value);
        const currentData = this.data[currentIndex];
        
        // Get current time window data (use full data density: 240 points for 24 hours)
        const windowSize = 240; // Use all 240 data points for 24 hours (10 points per hour, 6-minute intervals)
        const startIndex = currentIndex;
        const endIndex = Math.min(this.data.length - 1, startIndex + windowSize - 1);
        const windowData = this.data.slice(startIndex, endIndex + 1);
        
        // Update time display to match current slider position
        const timeDisplay = document.getElementById('time-display');
        const date = new Date(currentData.time);
        const formattedTime = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        timeDisplay.textContent = `Time: ${formattedTime}`;
        
        // Update time labels (show hourly labels for 240 data points)
        const timeLabels = windowData.map((d, index) => {
            // Show labels every 10 points (every hour, since 10 points = 1 hour with 6-minute intervals)
            if (index % 10 === 0) {
                const date = new Date(d.time);
                const hour = date.getHours();
                return `${hour.toString().padStart(2, '0')}:00`;
            }
            return ''; // Empty string for non-labeled points
        });
        
        // Update Speed Chart
        this.charts.speed.data.labels = timeLabels;
        this.charts.speed.data.datasets[0].data = windowData.map(d => d.oil_press_speed);
        this.charts.speed.update('none');
        
        // Update Power Chart
        this.charts.power.data.labels = timeLabels;
        this.charts.power.data.datasets[0].data = windowData.map(d => d.pv_power);
        this.charts.power.data.datasets[1].data = windowData.map(d => d.press_power);
        this.charts.power.update('none');
        
        // Update SOC Chart
        this.charts.soc.data.labels = timeLabels;
        this.charts.soc.data.datasets[0].data = windowData.map(d => d.soc);
        this.charts.soc.update('none');
        
        // Update Reward Chart
        this.charts.reward.data.labels = timeLabels;
        this.charts.reward.data.datasets[0].data = windowData.map(d => d.reward);
        this.charts.reward.update('none');
    }
    
    onTimeChange(event) {
        this.currentTimeIndex = parseInt(event.target.value);
        this.updateCharts();
    }
    
    togglePlay() {
        const playBtn = document.getElementById('play-btn');
        
        if (this.isPlaying) {
            clearInterval(this.playInterval);
            this.isPlaying = false;
            playBtn.textContent = '▶️ Play';
        } else {
            this.isPlaying = true;
            playBtn.textContent = '⏸️ Pause';
            
            this.playInterval = setInterval(() => {
                if (this.currentTimeIndex >= this.data.length - 1) {
                    this.togglePlay(); // Stop playing
                    return;
                }
                
                this.currentTimeIndex++;
                this.timeSlider.value = this.currentTimeIndex;
                this.updateCharts();
            }, 100); // Fixed speed: 100ms per step
        }
    }
    
    resetTime() {
        this.currentTimeIndex = 0;
        this.timeSlider.value = 0;
        this.updateCharts();
        
        if (this.isPlaying) {
            this.togglePlay();
        }
    }
}

// Initialize chart when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('interactive-chart-container')) {
        new InteractiveChart('interactive-chart-container');
    }
}); 