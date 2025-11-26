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

  try {
    // Send email using a simple HTTP email service
    // Using a webhook that sends emails (you can set up Zapier/Make.com webhook)
    // For now, log everything - you can check Vercel logs
    
    // Try sending via a simple email API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || ''}`,
      },
      body: JSON.stringify({
        from: 'BusinessHub <onboarding@resend.dev>',
        to: 'partners.clearhub@gmail.com',
        reply_to: email,
        subject: `New BusinessHub Lead - ${name}`,
        text: emailContent,
      }),
    });

    if (emailResponse.ok) {
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Email send error:', error);
  }

  // Always return success - submissions are logged in Vercel
  // Check Vercel function logs: vercel logs [deployment-url]
  // Email will be sent if RESEND_API_KEY is configured, otherwise check logs
  return res.status(200).json({ 
    success: true, 
    message: 'Request received successfully',
    logged: true
  });
}

