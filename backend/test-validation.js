// Test de validation des jobs
function validateJobData(data, isUpdate = false) {
  if (isUpdate && Object.keys(data).length === 0) {
    throw new Error('No fields to update');
  }

  // if not an update or field is present, validate required fields for creation
  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Job title is required and must be a non-empty string');
    }
    if (!data.location || typeof data.location !== 'string') {
      throw new Error('Job location is required');
    }
    // company can be passed either as numeric ID or name string
    if (!data.company_id && !data.company) {
      throw new Error('Company ID or name is required');
    }
  }

  // validation for optional numeric fields if present
  if (data.salary !== undefined && typeof data.salary !== 'number') {
    throw new Error('Salary must be a number');
  }

  return true;
}

try {
  // Test avec description manquante
  const testData = {
    title: 'Test Job',
    location: 'Paris',
    company: 'Test Company'
  };

  validateJobData(testData, false);
  console.log('✅ SUCCÈS: La description n\'est plus requise');

  // Test avec description vide
  const testData2 = {
    title: 'Test Job 2',
    location: 'Paris',
    company: 'Test Company',
    description: ''
  };

  validateJobData(testData2, false);
  console.log('✅ SUCCÈS: La description vide est acceptée');

} catch (error) {
  console.log('❌ ÉCHEC:', error.message);
}