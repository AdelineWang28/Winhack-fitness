// Show specified page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    if (pageId === 'statistics') {
        updateChart();
        displayRewards();
    }
}

// Save profile information
function saveProfile() {
    const name = document.getElementById('name').value;
    const age = parseInt(document.getElementById('age').value);
    const height = parseInt(document.getElementById('height').value);
    const weight = parseInt(document.getElementById('weight').value);

    let errors = [];

    if (!name) errors.push('Name is required');
    if (isNaN(age) || age <= 0 || age > 150) errors.push('Invalid age (1-150)');
    if (isNaN(height) || height <= 0 || height > 250) errors.push('Invalid height (1-250 cm)');
    if (isNaN(weight) || weight <= 0 || weight > 200) errors.push('Invalid weight (1-200 kg)');

    if (errors.length > 0) {
        alert(errors.length === 1 ? errors[0] : 'Invalid values detected, please correct.');
        return;
    }

    const profile = { name, age, height, weight };
    localStorage.setItem('profile', JSON.stringify(profile));
    alert('Profile saved successfully!');
    displayProfileInfo();
}

// Display profile information
function displayProfileInfo() {
    const profile = JSON.parse(localStorage.getItem('profile'));
    if (profile) {
        document.getElementById('profile-info').innerHTML = `
            <p>Name: ${profile.name}</p>
            <p>Age: ${profile.age}</p>
            <p>Height: ${profile.height} cm</p>
            <p>Weight: ${profile.weight} kg</p>
        `;
    }
}

// Save exercise record
function saveExercise() {
    const exerciseName = document.getElementById('exercise-name').value;
    const exerciseDuration = parseInt(document.getElementById('exercise-duration').value);
    const caloriesBurned = parseInt(document.getElementById('calories-burned').value);
    const exerciseDate = document.getElementById('exercise-date').value;

    if (!exerciseName || isNaN(exerciseDuration) || exerciseDuration <= 0 ||
        isNaN(caloriesBurned) || caloriesBurned <= 0 || !exerciseDate) {
        alert('Please complete all fields with valid values!');
        return;
    }

    const record = { exerciseName, exerciseDuration, caloriesBurned, date: exerciseDate };
    let exercises = JSON.parse(localStorage.getItem('exercises')) || [];
    exercises.push(record);
    localStorage.setItem('exercises', JSON.stringify(exercises));

    alert('Exercise record saved successfully!');
    displayExerciseRecords();
}

// Display exercise records
function displayExerciseRecords() {
    const exercises = JSON.parse(localStorage.getItem('exercises')) || [];
    const recordsDiv = document.getElementById('exercise-records');

    if (exercises.length === 0) {
        recordsDiv.innerHTML = '<p class="text-gray-500">No exercise records available.</p>';
    } else {
        recordsDiv.innerHTML = `
            <table class="w-full border-collapse border border-gray-300">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="border border-gray-300 px-4 py-2">Date</th>
                        <th class="border border-gray-300 px-4 py-2">Exercise</th>
                        <th class="border border-gray-300 px-4 py-2">Duration (min)</th>
                        <th class="border border-gray-300 px-4 py-2">Calories Burned</th>
                    </tr>
                </thead>
                <tbody>
                    ${exercises.map(record => `
                        <tr class="hover:bg-gray-100">
                            <td class="border border-gray-300 px-4 py-2">${record.date}</td>
                            <td class="border border-gray-300 px-4 py-2">${record.exerciseName}</td>
                            <td class="border border-gray-300 px-4 py-2">${record.exerciseDuration}</td>
                            <td class="border border-gray-300 px-4 py-2">${record.caloriesBurned}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}

// Save goals
function saveGoals() {
    const weeklyGoal = parseInt(document.getElementById('weekly-goal').value);
    const monthlyGoal = parseInt(document.getElementById('monthly-goal').value);

    if (isNaN(weeklyGoal) || weeklyGoal <= 0 || isNaN(monthlyGoal) || monthlyGoal <= 0) {
        alert('Please enter positive values for goals!');
        return;
    }

    const goals = { weeklyGoal, monthlyGoal };
    localStorage.setItem('goals', JSON.stringify(goals));
    alert('Goals saved successfully!');
}

// Update chart
function updateChart() {
    const filterType = document.getElementById('filter-type').value;
    const exercises = JSON.parse(localStorage.getItem('exercises')) || [];
    const ctx = document.getElementById('caloriesChart');

    if (!ctx) {
        console.error("Canvas element 'caloriesChart' not found!");
        return;
    }

    if (exercises.length === 0) {
        alert("No exercise data available!");
        return;
    }

    // 1️⃣ **计算 X 轴数据**
    let labels = [];
    let dataValues = {};
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (filterType === 'month') {
        // 以 **天** 为单位
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);

        // 初始化数据
        labels.forEach(label => dataValues[label] = 0);

        exercises.forEach(record => {
            if (record.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
                dataValues[record.date] += record.caloriesBurned;
            }
        });

    } else if (filterType === 'year') {
        // 以 **月** 为单位
        labels = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);

        // 初始化数据
        labels.forEach(label => dataValues[label] = 0);

        exercises.forEach(record => {
            const recordMonth = record.date.slice(0, 7);
            if (recordMonth.startsWith(`${year}`)) {
                dataValues[recordMonth] += record.caloriesBurned;
            }
        });

    } else if (filterType === 'week') {
        // 以 **周** 为单位
        let startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // 本周开始
        let endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6); // 本周结束

        for (let i = 0; i < 4; i++) { // 过去四周
            const weekLabel = `Week ${i + 1}`;
            labels.unshift(weekLabel);
            dataValues[weekLabel] = 0;

            exercises.forEach(record => {
                const recordDate = new Date(record.date);
                if (recordDate >= startOfWeek && recordDate <= endOfWeek) {
                    dataValues[weekLabel] += record.caloriesBurned;
                }
            });

            endOfWeek = new Date(startOfWeek);
            startOfWeek.setDate(startOfWeek.getDate() - 7);
        }
    }

    const chartLabels = Object.keys(dataValues);
    const chartData = Object.values(dataValues);

    // 2️⃣ **调整柱状图宽度**
    let barPercentage = 0.5; // 默认中等
    let categoryPercentage = 0.7;

    if (filterType === 'month') {
        barPercentage = 0.3;
        categoryPercentage = 0.6;
    } else if (filterType === 'year') {
        barPercentage = 0.5;
        categoryPercentage = 0.7;
    } else if (filterType === 'week') {
        barPercentage = 0.6;
        categoryPercentage = 0.8;
    }

    // 3️⃣ **绘制柱状图**
    if (window.myChart) {
        window.myChart.destroy();
    }

    const chartCtx = ctx.getContext('2d');
    window.myChart = new Chart(chartCtx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Calories Burned',
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                barPercentage: barPercentage,
                categoryPercentage: categoryPercentage
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: filterType === 'month' ? 'Date' : filterType === 'year' ? 'Month' : 'Week' } },
                y: { beginAtZero: true, title: { display: true, text: 'Calories Burned' } }
            }
        }
    });
}


// Display rewards
function displayRewards() {
    const goals = JSON.parse(localStorage.getItem('goals')) || { weeklyGoal: 0, monthlyGoal: 0 };
    const exercises = JSON.parse(localStorage.getItem('exercises')) || [];
    let weeklyTotal = 0;
    let monthlyTotal = 0;

    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    const currentMonth = new Date().getMonth();

    exercises.forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate >= currentWeekStart) weeklyTotal += parseInt(record.caloriesBurned);
        if (recordDate.getMonth() === currentMonth) monthlyTotal += parseInt(record.caloriesBurned);
    });

    let rewardInfo = '<h3>Medal Rules: 100%: Bronze Medal, 200%: Silver Medal, 300%: Gold Medal, 400%: Diamond Medal</h3>';

    if (goals.weeklyGoal > 0) {
        const weeklyPercentage = (weeklyTotal / goals.weeklyGoal) * 100;
        rewardInfo += `<p>Weekly Achievement: ${weeklyPercentage.toFixed(2)}%</p>`;
    }
    if (goals.monthlyGoal > 0) {
        const monthlyPercentage = (monthlyTotal / goals.monthlyGoal) * 100;
        rewardInfo += `<p>Monthly Achievement: ${monthlyPercentage.toFixed(2)}%</p>`;
    }

    document.getElementById('reward-info').innerHTML = rewardInfo;
}

// Initialize data on page load
window.onload = function () {
    displayProfileInfo();
    displayExerciseRecords();
    updateChart();
};
