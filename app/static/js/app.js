// Function to create the chart configuration object
function createChartConfig(totalPoints) {
    return {
        type: 'doughnut',
        data: {
            datasets: [{
                label: 'Points Dataset',
                data: [totalPoints, 100 - totalPoints], // earned points, remaining points
                backgroundColor: [
                    'rgb(54, 162, 235)', // Blue for earned points
                    'rgba(211, 211, 211, 0.3)' // Light grey for remaining points
                ],
                borderColor: [
                    'rgb(54, 162, 235)', // Blue for earned points border
                    'rgba(0, 0, 0, 0)' // Transparent for remaining points border
                ],
                borderWidth: 1,
                cutout: '50%' // Adjust cutout percentage for design
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Do not display the legend
                },
                tooltip: {
                    enabled: true // Enable tooltips
                }
            }
        }
    };
}

// On document ready, fetch the history and render the initial chart
document.addEventListener('DOMContentLoaded', function () {
    var ctx = document.getElementById('pointsChart').getContext('2d');
    var total_points = document.getElementById('total-points').getAttribute('data-points');
    // Initialize chart with total points
    window.pointsChart = new Chart(ctx, createChartConfig(total_points));

    // Toggle the visibility of the logout button
    document.querySelector('.burger-menu').addEventListener('click', function() {
        var logoutLink = document.querySelector('.logout-link');
        logoutLink.style.display = logoutLink.style.display === 'none' ? 'block' : 'none';
    });

    fetchPointsHistory();

    document.getElementById('points-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const pointsChange = document.getElementById('points_value').value;
        const description = document.getElementById('description').value;

        if (!pointsChange.trim()) {
            alert('Please enter a valid point value.');
            return;
        }

        const formData = new FormData();
        formData.append('points_change', pointsChange);
        formData.append('description', description);

        fetch('/update', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                fetchPointsHistory();
                // Clear the inputs after successful update
                document.getElementById('points_value').value = '';
                document.getElementById('description').value = '';
            } else {
                alert('Failed to update points.');
            }
        })
        .catch(error => console.error('Error updating points:', error));
    });
});

function fetchPointsHistory() {
    fetch('/history')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updatePointsChart(data.totalPoints);
            populateHistoryTable(data.pointsHistory);
        } else {
            console.error('Error fetching points history:', data.error);
        }
    })
    .catch(error => console.error('Error fetching points history:', error));
}

function populateHistoryTable(pointsHistory) {
    const historyContainer = document.querySelector('.history-container');
    historyContainer.innerHTML = '<div class="history-header"><span>Date</span><span>Description</span><span>Points</span></div>';
    pointsHistory.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('history-entry');
        entryDiv.innerHTML = `<span>${entry.timestamp.split(' ')[0]}</span><span>${entry.description}</span><span>${entry.points}</span>`;
        historyContainer.appendChild(entryDiv);
    });
}

function updatePointsChart(totalPoints) {
    totalPoints = parseInt(totalPoints); // Make sure total_points is an integer
    var remainingPoints = 100 - totalPoints;

    // Check if chart instance already exists
    if (!window.pointsChart) {
        // Create chart instance if it doesn't exist
        window.pointsChart = new Chart(ctx, createChartConfig(totalPoints));
    } else {
        // Update the chart data and refresh
        window.pointsChart.data.datasets[0].data = [totalPoints, remainingPoints];
        window.pointsChart.update();
    }
    document.getElementById('total-points').textContent = `${totalPoints}/100`;
}
