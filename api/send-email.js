export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company, budget, timeline, project } = req.body;

  const emailContent = `
New BusinessHub Lead:

Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'Not provided'}
Budget: ${budget}
Timeline: ${timeline}
Project Description: ${project}

Submitted: ${new Date().toLocaleString()}
  `;

  // Log submission first
  console.log('=== BUSINESSHUB LEAD SUBMISSION ===');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Phone:', phone);
  console.log('Company:', company || 'Not provided');
  console.log('Budget:', budget);
  console.log('Timeline:', timeline);
  console.log('Project:', project);
  console.log('Timestamp:', new Date().toISOString());
  console.log('===================================');

  // Always return success - submissions are logged in Vercel
  // Check Vercel function logs to see all submissions
  // You can set up email forwarding from Vercel logs or use a monitoring service
  return res.status(200).json({ success: true, message: 'Request received successfully' });
}

