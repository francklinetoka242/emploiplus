import jobService from '../services/job.service.js';

async function getJobs(req, res) {
  try {
    const result = await jobService.getJobs(req.query);
    // Service returns { jobs: [...], pagination: {...} }
    res.json({ 
      data: result.jobs,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error('getJobs error', err);
    // check if error has a status property (validation errors); default to 500
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

async function getJobById(req, res) {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.json({ data: job });
  } catch (err) {
    console.error('getJobById error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}

async function createJob(req, res) {
  try {
    const newJob = await jobService.createJob(req.body);
    res.status(201).json({ data: newJob });
  } catch (err) {
    console.error('createJob error', err);
    
    // Detect PostgreSQL foreign key constraint violations
    let status = 500;
    let message = err.message || 'Internal server error';
    
    if (err.message && err.message.includes('fk_jobs_company_id')) {
      status = 400;
      message = 'The specified company_id does not exist';
    } else if (err.status) {
      status = err.status;
    } else if (/required|must|invalid|not found|does not exist|does not reference/i.test(err.message)) {
      status = 400;
    }
    
    res.status(status).json({ message });
  }
}

async function updateJob(req, res) {
  try {
    const updated = await jobService.updateJob(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) {
    console.error('updateJob error', err);
    
    // Detect PostgreSQL foreign key constraint violations
    let status = 500;
    let message = err.message || 'Internal server error';
    
    if (err.message && err.message.includes('fk_jobs_company_id')) {
      status = 400;
      message = 'The specified company_id does not exist';
    } else if (err.status) {
      status = err.status;
    } else if (/required|must|invalid|not found|does not exist|does not reference/i.test(err.message)) {
      status = 400;
    }
    
    res.status(status).json({ message });
  }
}

async function deleteJob(req, res) {
  try {
    await jobService.deleteJob(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error('deleteJob error', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
}
// toggle published state (and set published_at timestamp if going live)
async function publishJob(req, res) {
  try {
    const { published } = req.body;
    if (typeof published !== 'boolean') {
      const error = new Error('Published flag must be boolean');
      error.status = 400;
      throw error;
    }
    const updates = { published };
    if (published) {
      updates.published_at = new Date();
    } else {
      updates.published_at = null;
    }
    const updated = await jobService.updateJob(req.params.id, updates);
    res.json({ data: updated });
  } catch (err) {
    console.error('publishJob error:', err);
    const status = err.status || (/required|must/i.test(err.message) ? 400 : 500);
    res.status(status).json({ message: err.message || 'Internal server error' });
  }
}

// share job by email
async function shareJobByEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Email valide requis' });
    }
    
    const job = await jobService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Offre introuvable' });
    }

    // Send email
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const jobUrl = `${process.env.FRONTEND_URL || 'https://emploiplus-group.com'}/apply/${job.id}`;
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Offre d'emploi: ${job.title}`,
      html: `
        <h2>Découvrez cette offre d'emploi</h2>
        <p><strong>${job.title}</strong></p>
        <p><strong>Entreprise:</strong> ${job.company}</p>
        <p><strong>Lieu:</strong> ${job.location}</p>
        ${job.salary ? `<p><strong>Salaire:</strong> ${job.salary}</p>` : ''}
        ${job.description ? `<p><strong>Description:</strong> ${job.description}</p>` : ''}
        <p><a href="${jobUrl}">Voir l'offre complète et postuler</a></p>
        <p>Cordialement,<br>Emploi Plus Group</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Offre envoyée par email avec succès' });
  } catch (err) {
    console.error('shareJobByEmail error:', err);
    res.status(500).json({ message: err.message || 'Erreur envoi email' });
  }
}

export {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  shareJobByEmail,
};
