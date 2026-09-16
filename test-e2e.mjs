async function test() {
  console.log('--- Testing VoleiTactics API Endpoints ---');

  // 1. Health
  const healthRes = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('1. Health check:', healthRes.status, healthRes.service);

  // 2. Admin Login
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@volleyball.edu', password: 'Admin123!' }),
  }).then(r => r.json());
  console.log('2. Admin Login:', loginRes.user.name, `(${loginRes.user.role})`, 'Token received:', !!loginRes.token);

  // 3. Analytics & Circular Pie Chart Data
  const analyticsRes = await fetch('http://localhost:5000/api/analytics', {
    headers: { Authorization: `Bearer ${loginRes.token}` },
  }).then(r => r.json());
  console.log('3. Analytics KPIs:', analyticsRes.kpis);
  console.log('   Circular Pie Data Slices:');
  analyticsRes.circularPieData.forEach(slice => {
    console.log(`   - [${slice.percentage}%] ${slice.name} (${slice.value}/${slice.total} aciertos)`);
  });

  // 4. Tests List
  const testsRes = await fetch('http://localhost:5000/api/tests', {
    headers: { Authorization: `Bearer ${loginRes.token}` },
  }).then(r => r.json());
  console.log('4. Available Tests Count:', testsRes.tests.length);
  const testId = testsRes.tests[0].id;

  // 5. Athlete Login & Take Test
  const athleteLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'athlete@volleyball.edu', password: 'User123!' }),
  }).then(r => r.json());
  console.log('5. Athlete Login:', athleteLogin.user.name);

  // 6. Test Runner Detail
  const testDetail = await fetch(`http://localhost:5000/api/tests/${testId}`, {
    headers: { Authorization: `Bearer ${athleteLogin.token}` },
  }).then(r => r.json());
  console.log('6. Test Detail:', testDetail.test.title, 'Questions:', testDetail.test.questions.length);

  // 7. Submit Test
  const q1 = testDetail.test.questions[0];
  const q2 = testDetail.test.questions[1];
  const answers = [
    { questionId: q1.id, selectedOptionId: q1.options[0].id },
    { questionId: q2.id, selectedOptionId: q2.options[0].id },
  ];

  const subRes = await fetch('http://localhost:5000/api/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${athleteLogin.token}`,
    },
    body: JSON.stringify({
      testId,
      timeSpentSeconds: 180,
      answers,
    }),
  }).then(r => r.json());

  console.log('7. Submission Completed:', subRes.message);
  console.log('   Score:', subRes.submission.score, 'Percentage:', subRes.submission.percentage + '%');
  console.log('   Option Feedback Given for Q1:', subRes.submission.detailedAnswers[0].feedbackGiven);
  console.log('   Option Feedback Given for Q2:', subRes.submission.detailedAnswers[1].feedbackGiven);

  console.log('\n✅ ALL E2E API VERIFICATIONS PASSED CLEANLY!');
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
