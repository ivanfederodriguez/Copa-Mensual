// Data Source: Analysis Report (Jan 2025 vs Jan 2026)
// IPC Data Source: IPC.csv (Jan 25: 7864.1257, Jan 26: 10309.62901)

// Days 1-31
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

// Nominal Data 2025
const data2025Nominal = [
    0, 3648.80, 2976.30, 0, 0, 2946.46, 2562.87, 2807.33, 2751.16, 5102.39,
    0, 0, 14456.67, 9301.50, 14548.63, 5159.61, 5872.08, 0, 0, 2895.52,
    2289.16, 19203.77, 14565.03, 16825.75, 0, 0, 12149.67, 8594.75, 2885.17, 3913.78, 3663.81
];

// Nominal Data 2026
const data2026 = [
    0, 3640.06, 0, 0, 4629.38, 2738.52, 2942.34, 3643.92, 3695.59, 0,
    0, 4859.28, 19255.65, 15666.38, 17675.97, 5995.63, 0, 0, 5229.59, 2340.86,
    6580.80, 22420.90, 21066.19, 0, 0, 15424.52, 14204.79, 1354.91, 1547.71, 1827.27, 0
];

// --- Real Variation Calculation ---
const ipcJan25 = 7864.1257;
const ipcJan26 = 10309.62901;
// Inflation Factor: Multiplier to bring 2025 values to 2026 purchasing power
const inflationFactor = ipcJan26 / ipcJan25; // ~1.3109
const inflationPercent = (inflationFactor - 1) * 100;

// Deflate the series (Or rather, 'Inflate' 2025 to compare with 2026)
// User asked to "deflactes la serie", effectively making them comparable in Real Terms.
// Calculating 2025 at Jan 2026 prices.
const data2025Real = data2025Nominal.map(val => val * inflationFactor);

// Initialize Chart
const ctx = document.getElementById('dailyChart').getContext('2d');

// Gradient for 2026 (Green/Emerald)
const gradient2026 = ctx.createLinearGradient(0, 0, 0, 400);
gradient2026.addColorStop(0, 'rgba(16, 185, 129, 0.9)'); // Emerald
gradient2026.addColorStop(1, 'rgba(16, 185, 129, 0.4)');

// Gradient for 2025 Nominal (Gray/Neutral)
const gradient2025 = ctx.createLinearGradient(0, 0, 0, 400);
gradient2025.addColorStop(0, 'rgba(148, 163, 184, 0.8)'); // Slate 400
gradient2025.addColorStop(1, 'rgba(148, 163, 184, 0.4)');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: days,
        datasets: [
            {
                label: 'Enero 2026',
                data: data2026,
                backgroundColor: gradient2026,
                borderRadius: 4,
                borderSkipped: false,
                borderSkipped: false,
                order: 1
            },
            {
                label: 'Enero 2025',
                data: data2025Nominal, // Nominal values as requested
                backgroundColor: '#94a3b8',
                borderRadius: 4,
                borderSkipped: false,
                borderSkipped: false,
                order: 2
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                borderColor: 'rgba(0,0,0,0.1)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (context.parsed.y !== null) {
                            return `${label}: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(context.parsed.y)} M`;
                        }
                    },
                    afterBody: function (tooltipItems) {
                        const val2026 = tooltipItems.find(i => i.dataset.label === 'Enero 2026')?.raw || 0;
                        const val2025 = tooltipItems.find(i => i.dataset.label === 'Enero 2025')?.raw || 0; // Nominal

                        // Nominal diff
                        if (val2026 > 0 && val2025 > 0) {
                            const diff = val2026 - val2025;
                            const sign = diff > 0 ? '+' : '';
                            return `\nVar. Nominal: ${sign}${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(diff)} M`;
                        }
                    }
                }
            },
            legend: {
                labels: {
                    color: '#64748b',
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        },
        scales: {
            x: {
                stacked: false,
                grid: { display: false },
                ticks: { color: '#64748b' },
                title: { display: true, text: 'Día', color: '#94a3b8' }
            },
            y: {
                stacked: false,
                grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                ticks: {
                    color: '#64748b',
                    callback: val => '$' + (val / 1000).toFixed(0) + 'k'
                }
            }
        },
        interaction: { mode: 'index', intersect: false },
    }
});

// Calculate Summaries and Update DOM
const sum2026 = data2026.reduce((a, b) => a + b, 0);
const sum2025Nominal = data2025Nominal.reduce((a, b) => a + b, 0);
const sum2025Real = data2025Real.reduce((a, b) => a + b, 0);

const variationRealPercent = ((sum2026 / sum2025Real) - 1) * 100;

document.addEventListener('DOMContentLoaded', () => {
    const infElem = document.getElementById('inflation-val');
    // Only target real-var-val, as inflation-val might be gone or not needed if only one KPI
    const realElem = document.getElementById('real-var-val');

    if (infElem) {
        infElem.textContent = inflationPercent.toFixed(2) + '%';
    }

    if (realElem) {
        const sign = variationRealPercent > 0 ? '+' : '';
        // Format to 2 decimals
        realElem.textContent = `${sign}${variationRealPercent.toFixed(2)}%`;

        // Apply color - Red for negative (loss of purchase power), Green for positive
        if (variationRealPercent < 0) {
            realElem.style.color = 'var(--accent-danger)';
            // Optional: Add a down arrow if not present in text
        } else {
            realElem.style.color = 'var(--accent-success)';
        }
    }
});
