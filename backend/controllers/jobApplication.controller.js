import jobService from '../services/job.service.js';
import jobApplicationService from '../services/jobApplication.service.js';
import { sendApplicationEmail } from '../services/email.service.js';

// create a new application and send a notification email
async function createJobApplication(req, res) {
  try {
    const {
      job_id,
      cv_url,
      cover_letter_url,
      receipt_url,
      additional_docs,
      message,
      applicant_email,
    } = req.body;

    if (!job_id) {
      return res.status(400).json({ message: 'job_id is required' });
    }

    const job = await jobService.getJobById(job_id);
    if (!job) {
      return res.status(404).json({ message: "Offre d'emploi introuvable" });
    }

    // destination email: specific field takes precedence, then company main email
    const recipient = job.application_email || job.company_email || job.company?.email;
    if (!recipient) {
      return res.status(400).json({ message: 'Aucun email de contact disponible pour cette offre' });
    }

    // prepare attachments array by converting urls to nodemailer-friendly objects
    const attachments = [];
    const tryAttach = (url, name) => {
      if (url) {
        attachments.push({ path: url, filename: name });
      }
    };
    tryAttach(cv_url, 'CV.pdf');
    tryAttach(cover_letter_url, 'Lettre.pdf');
    tryAttach(receipt_url, 'Recepisse.pdf');
    if (Array.isArray(additional_docs)) {
      additional_docs.forEach((u, idx) => {
        tryAttach(u, `doc_${idx + 1}`);
      });
    }

    // send email
    await sendApplicationEmail({
      from: process.env.EMAIL_FROM || 'no-reply@emploi-plus.com',
      to: recipient,
      replyTo: applicant_email || undefined,
      subject: `Nouvelle candidature – ${job.title}`,
      text: `Un candidat a postulé pour l'offre "${job.title}".

Message : ${message || '(aucun message)'}

Les documents sont joints au message ou accessibles via les liens ci-dessous.`,
      attachments,
    });

    // record in DB for admin tracking
    const record = await jobApplicationService.recordApplication({
      job_id,
      applicant_id: req.user?.id || null,
      applicant_email: applicant_email || null,
      cv_url,
      cover_letter_url,
      receipt_url,
      additional_docs,
      message,
      status: 'sent',
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('createJobApplication error:', err);
    res.status(500).json({ message: err.message || 'Erreur interne' });
  }
}

// check if the authenticated user already applied to this job
async function checkApplied(req, res) {
  try {
    const jobId = req.params.jobId;
    if (!req.user) {
      return res.json({ alreadyApplied: false });
    }
    const applied = await jobApplicationService.checkUserApplied(jobId, req.user.id);
    res.json({ alreadyApplied: applied });
  } catch (err) {
    console.error('checkApplied error:', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
}

// admin helpers
async function listApplications(req, res) {
  try {
    const apps = await jobApplicationService.fetchAll();
    res.json(apps);
  } catch (err) {
    console.error('listApplications error:', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
}

async function getApplicationById(req, res) {
  try {
    const app = await jobApplicationService.fetchById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });
    res.json(app);
  } catch (err) {
    console.error('getApplicationById error:', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
}

async function updateApplicationStatus(req, res) {
  try {
    const { status } = req.body;
    const updated = await jobApplicationService.changeStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ message: 'Erreur interne' });
  }
}

export {
  createJobApplication,
  checkApplied,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
};
