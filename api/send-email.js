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

  try {
    // Send email using Resend API (free tier available)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY || 're_123456789'}`,
      },
      body: JSON.stringify({
        from: 'BusinessHub <noreply@businesshub-platform.vercel.app>',
        to: 'partners.clearhub@outlook.com',
        reply_to: email,
        subject: `New BusinessHub Lead - ${name}`,
        text: emailContent,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

