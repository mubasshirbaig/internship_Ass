const chartData = {};
let currentSymbol = 'ethusdt';
let currentTimeframe = '1m';
let chart;
const ctx = document.getElementById('candlestickChart').getContext('2d');

function initChart() {
    chart = new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: currentSymbol.toUpperCase(),
                data: chartData[currentSymbol] || [],
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'timeseries',
                    title: {
                        display: true,
                        text: 'Time'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    },
                    beginAtZero: false,
                },
            },
        },
    });
}

function updateChart() {
    if (chartData[currentSymbol]) {
        chart.data.datasets[0].data = chartData[currentSymbol];
        chart.update();
    }
}

function connectWebSocket() {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${currentSymbol}@kline_${currentTimeframe}`);

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const candle = message.k;

        if (candle.x) {
            const candleData = {
                x: new Date(candle.t),
                o: parseFloat(candle.o),
                h: parseFloat(candle.h),
                l: parseFloat(candle.l),
                c: parseFloat(candle.c),
            };

            if (!chartData[currentSymbol]) {
                chartData[currentSymbol] = [];
            }
            chartData[currentSymbol].push(candleData);

            updateChart();
        }
    };
}

function switchCoin(newSymbol) {
    currentSymbol = newSymbol;
    if (!chartData[currentSymbol]) {
        chartData[currentSymbol] = [];
    }
    updateChart();
}

document.getElementById('cryptoSelector').addEventListener('change', (event) => {
    switchCoin(event.target.value);
});

document.getElementById('timeframeSelector').addEventListener('change', (event) => {
    currentTimeframe = event.target.value;
    connectWebSocket();
});

// Initialize chart and WebSocket connection
initChart();
connectWebSocket();
