// smoke_jobs_test.js
// Simule la logique de mapping des offres dans `src/pages/Jobs.tsx`.

function unwrap(response) {
  return Array.isArray(response) ? response : (response?.data?.data ?? response?.data ?? response);
}

// Simule le state du composant
let allJobs = [];
let page = 1;
let hasMore = true;

function setAllJobs(newArr) { allJobs = newArr; }
function appendJobs(newArr) { allJobs = [...allJobs, ...newArr]; }

function handleJobsData(response, currentPage) {
  const newJobs = Array.isArray(unwrap(response)) ? unwrap(response) : [];
  if (currentPage === 1) {
    setAllJobs(newJobs);
  } else {
    appendJobs(newJobs);
  }
  const pagination = response?.pagination || {};
  hasMore = !!pagination.hasNextPage;
}

// Préparer 10 jobs de démonstration
function makeJobs(start, count) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({ id: start + i, title: `Job ${start + i}` });
  }
  return arr;
}

// Simulate initial fetch (page 1)
const resPage1 = { data: { data: makeJobs(1, 10) }, pagination: { page: 1, hasNextPage: true } };
handleJobsData(resPage1, 1);
console.log('After initial load: allJobs.length =', allJobs.length);
console.log('First IDs:', allJobs.map(j => j.id).slice(0,5));

// Simulate clicking 'Charger plus' -> page becomes 2, new fetch returns next 10
page = 2;
const resPage2 = { data: { data: makeJobs(11, 10) }, pagination: { page: 2, hasNextPage: false } };
handleJobsData(resPage2, page);
console.log('After load more: allJobs.length =', allJobs.length);
console.log('IDs now:', allJobs.map(j => j.id).slice(0,20));

// Assertions (simple)
console.log('Assertion page1 kept:', allJobs.slice(0,10).every((j, idx) => j.id === idx + 1));
console.log('Assertion page2 appended:', allJobs.slice(10,20).every((j, idx) => j.id === 11 + idx));
