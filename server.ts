import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Global runtime SMTP configuration with env fallbacks
let smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromName: process.env.SMTP_FROM_NAME || 'Sogesti GRC RiskFlow',
  fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@sogesti-grc.com',
  enabled: true,
};

// Email Dispatch Audit Log
interface EmailLogEntry {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  type: string;
  status: 'Envoyé' | 'Échec' | 'Simulé';
  details?: string;
  error?: string;
}

const emailLogs: EmailLogEntry[] = [
  {
    id: 'msg-init-1',
    timestamp: new Date().toISOString(),
    to: 'riskmanager@sogesti-grc.com',
    subject: 'Initialisation du Service d\'Expédition Gmail SMTP',
    type: 'Système',
    status: 'Envoyé',
    details: 'Serveur d\'envoi SMTP initialisé sur le port 587 (smtp.gmail.com)'
  }
];

// Helper to create transport
function createTransporter(customConfig?: typeof smtpConfig) {
  const cfg = customConfig || smtpConfig;

  // If host is gmail or port is 465/587
  const isGmail = cfg.host.includes('gmail.com');

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure, // true for 465, false for other ports
    auth: cfg.user && cfg.pass ? {
      user: cfg.user,
      pass: cfg.pass,
    } : undefined,
    tls: {
      rejectUnauthorized: false // Avoid self-signed certificate issues in dev/test
    }
  });
}

// --- API ROUTES ---

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Sogesti GRC Express Email Backend' });
});

// GET /api/email/config - Get current SMTP settings (masked password)
app.get('/api/email/config', (req, res) => {
  res.json({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.user,
    hasPass: Boolean(smtpConfig.pass),
    passMasked: smtpConfig.pass ? '••••••••••••••••' : '',
    fromName: smtpConfig.fromName,
    fromEmail: smtpConfig.fromEmail,
    enabled: smtpConfig.enabled,
    isGmail: smtpConfig.host.includes('gmail.com'),
  });
});

// POST /api/email/config - Save dynamic SMTP settings from SuperAdmin UI
app.post('/api/email/config', (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail, enabled } = req.body;

  if (host !== undefined) smtpConfig.host = host;
  if (port !== undefined) smtpConfig.port = parseInt(port, 10);
  if (secure !== undefined) smtpConfig.secure = Boolean(secure);
  if (user !== undefined) smtpConfig.user = user;
  if (pass !== undefined && pass !== '') smtpConfig.pass = pass; // Only update pass if provided
  if (fromName !== undefined) smtpConfig.fromName = fromName;
  if (fromEmail !== undefined) smtpConfig.fromEmail = fromEmail;
  if (enabled !== undefined) smtpConfig.enabled = Boolean(enabled);

  console.log(`[SMTP CONFIG UPDATED] Host: ${smtpConfig.host}, User: ${smtpConfig.user}`);

  res.json({
    success: true,
    message: 'Configuration SMTP mise à jour avec succès.',
    config: {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.user,
      fromName: smtpConfig.fromName,
      fromEmail: smtpConfig.fromEmail,
      enabled: smtpConfig.enabled
    }
  });
});

// POST /api/email/test - Test connection & optionally send test email
app.post('/api/email/test', async (req, res) => {
  const { testEmail, host, port, secure, user, pass, fromName, fromEmail } = req.body;

  const testCfg = {
    host: host || smtpConfig.host,
    port: port ? parseInt(port, 10) : smtpConfig.port,
    secure: secure !== undefined ? Boolean(secure) : smtpConfig.secure,
    user: user !== undefined ? user : smtpConfig.user,
    pass: pass !== undefined && pass !== '' ? pass : smtpConfig.pass,
    fromName: fromName || smtpConfig.fromName,
    fromEmail: fromEmail || smtpConfig.fromEmail,
    enabled: true
  };

  if (!testCfg.user || !testCfg.pass) {
    return res.status(400).json({
      success: false,
      error: 'Veuillez saisir un identifiant Gmail / SMTP et un Mot de passe d\'application Google valide.'
    });
  }

  try {
    const transporter = createTransporter(testCfg);
    
    // Step 1: Verify SMTP Server connection
    await transporter.verify();

    // Step 2: Send test email if recipient requested
    let mailSentInfo = null;
    if (testEmail) {
      mailSentInfo = await transporter.sendMail({
        from: `"${testCfg.fromName}" <${testCfg.fromEmail || testCfg.user}>`,
        to: testEmail,
        subject: '🧪 [Sogesti GRC RiskFlow] Test d\'envoi e-mail réussi !',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4f46e5; padding: 15px; border-radius: 8px; text-align: center; color: white;">
              <h2 style="margin: 0; font-size: 20px;">Sogesti GRC RiskFlow</h2>
              <p style="margin: 5px 0 0 0; font-size: 13px;">Test d'expédition e-mail Gmail SMTP</p>
            </div>
            <div style="padding: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Félicitations ! 🎉</h3>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Votre serveur d'envoi d'e-mails Gmail SMTP a été correctement configuré et connecté à la plateforme <strong>Sogesti GRC RiskFlow</strong>.
              </p>
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; font-size: 13px; color: #334155; font-family: monospace;">
                • Serveur Hôte : ${testCfg.host}:${testCfg.port}<br/>
                • Compte d'expédition : ${testCfg.user}<br/>
                • Expéditeur affiché : ${testCfg.fromName}<br/>
                • Horodatage : ${new Date().toLocaleString('fr-FR')}
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                Ceci est un message de test automatique envoyé par le module SuperAdmin de Sogesti GRC.
              </p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; pt: 10px; text-align: center; font-size: 11px; color: #94a3b8;">
              &copy; 2026 Sogesti International S.A. — Système de Gestion Globale des Risques & Conformité
            </div>
          </div>
        `
      });

      // Log sent test
      emailLogs.unshift({
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        to: testEmail,
        subject: '🧪 Test d\'envoi e-mail réussi !',
        type: 'Test SMTP',
        status: 'Envoyé',
        details: `MessageID: ${mailSentInfo.messageId || 'OK'}`
      });
    }

    res.json({
      success: true,
      message: testEmail 
        ? `Connexion SMTP validée avec succès et e-mail de test envoyé à ${testEmail} !`
        : 'Connexion au serveur SMTP Gmail établie avec succès !',
      details: mailSentInfo ? { messageId: mailSentInfo.messageId } : null
    });

  } catch (err: any) {
    console.error('[SMTP TEST ERROR]', err);

    const errorMessage = err?.message || 'Erreur inconnue lors du test SMTP';

    emailLogs.unshift({
      id: `msg-err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to: testEmail || 'N/A',
      subject: 'Test SMTP',
      type: 'Test SMTP',
      status: 'Échec',
      error: errorMessage
    });

    res.status(500).json({
      success: false,
      error: `Échec de la connexion SMTP : ${errorMessage}`,
      suggestion: 'Vérifiez que vous avez bien utilisé un "Mot de passe d\'application Google" généré dans votre compte Google (Sécurité -> Mots de passe d\'application), et non votre mot de passe habituel.'
    });
  }
});

// POST /api/email/send - Dispatch an automated operational email
app.post('/api/email/send', async (req, res) => {
  const { to, subject, html, text, type, fromName } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({
      success: false,
      error: 'Les champs "to", "subject" et "html" ou "text" sont obligatoires.'
    });
  }

  // If SMTP is not configured or disabled, fallback to simulated logging
  if (!smtpConfig.user || !smtpConfig.pass) {
    const entry: EmailLogEntry = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to,
      subject,
      type: type || 'Notification Opérationnelle',
      status: 'Simulé',
      details: 'Simulation d\'envoi (Identifiants Gmail SMTP non renseignés dans SuperAdmin)'
    };
    emailLogs.unshift(entry);

    return res.json({
      success: true,
      simulated: true,
      message: 'Email simulé en local (Configurez Gmail SMTP dans le module SuperAdmin pour l\'expédition réelle).',
      log: entry
    });
  }

  try {
    const transporter = createTransporter();
    
    const senderName = fromName || smtpConfig.fromName;
    const senderEmail = smtpConfig.fromEmail || smtpConfig.user;

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html: html || `<p>${text}</p>`
    });

    const entry: EmailLogEntry = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to,
      subject,
      type: type || 'Notification Opérationnelle',
      status: 'Envoyé',
      details: `Expédié via Gmail SMTP (Message ID: ${info.messageId})`
    };
    emailLogs.unshift(entry);

    res.json({
      success: true,
      simulated: false,
      message: `E-mail envoyé avec succès à ${to}`,
      messageId: info.messageId
    });

  } catch (err: any) {
    console.error('[EMAIL SEND ERROR]', err);
    const errorMsg = err?.message || 'Erreur lors de l\'envoi de l\'e-mail';

    const entry: EmailLogEntry = {
      id: `err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      to,
      subject,
      type: type || 'Notification Opérationnelle',
      status: 'Échec',
      error: errorMsg
    };
    emailLogs.unshift(entry);

    res.status(500).json({
      success: false,
      error: `Échec d'envoi e-mail : ${errorMsg}`,
      log: entry
    });
  }
});

// GET /api/email/logs - Get email audit logs
app.get('/api/email/logs', (req, res) => {
  res.json({
    success: true,
    logs: emailLogs.slice(0, 100) // return last 100 logs
  });
});

// DELETE /api/email/logs - Clear logs
app.delete('/api/email/logs', (req, res) => {
  emailLogs.length = 0;
  res.json({ success: true, message: 'Journal des e-mails réinitialisé.' });
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur backend Express + Gmail SMTP démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
