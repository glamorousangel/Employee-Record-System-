function renderCategoricalDoughnutChart(canvasId, labels, values, colors, options = {}) {
	const canvas = document.getElementById(canvasId);
	if (!canvas || typeof Chart === 'undefined') {
		return null;
	}

	const safeLabels = Array.isArray(labels) ? labels.slice() : [];
	const safeValues = Array.isArray(values)
		? values.map((value) => {
			const parsed = Number(value);
			return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
		})
		: [];
	const safeColors = Array.isArray(colors) && colors.length
		? colors.slice()
		: ['#94a3b8'];

	let finalLabels = safeLabels;
	let finalValues = safeValues;
	let finalColors = safeColors;

	const hasUsableData = finalValues.length && finalValues.some((value) => value > 0);
	if (!hasUsableData) {
		finalLabels = ['No Data'];
		finalValues = [1];
		finalColors = ['#cbd5e1'];
	}

	while (finalColors.length < finalValues.length) {
		finalColors.push(finalColors[finalColors.length - 1]);
	}

	return new Chart(canvas, {
		type: options.type || 'doughnut',
		data: {
			labels: finalLabels,
			datasets: [
				{
					data: finalValues,
					backgroundColor: finalColors,
					borderColor: '#ffffff',
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: {
					position: options.legendPosition || 'bottom',
					labels: {
						boxWidth: 12,
						color: '#1e293b',
						font: { size: 12, weight: '500' },
					},
				},
				tooltip: {
					callbacks: {
						label: function(context) {
							const label = context.label || '';
							const value = context.parsed || 0;
							return `${label}: ${value}`;
						},
					},
				},
			},
		},
	});
}

function renderHrAttendancePieChart(canvasId, attendanceData) {
	const safeData = attendanceData || {};
	return renderCategoricalDoughnutChart(
		canvasId,
		['Present', 'Absent', 'On Leave'],
		[Number(safeData.present || 0), Number(safeData.absent || 0), Number(safeData.on_leave || 0)],
		['#10b981', '#ef4444', '#f59e0b'],
		{ type: 'pie', legendPosition: 'bottom' }
	);
}
