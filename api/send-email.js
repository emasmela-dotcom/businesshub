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
    // Send email using Web3Forms via serverless function
    const formData = new URLSearchParams();
    formData.append('access_key', '9f6ac12b-93eb-463c-9d70-61d3781e5518');
    formData.append('subject', `New BusinessHub Lead - ${name}`);
    formData.append('from_name', 'BusinessHub Platform');
    formData.append('message', emailContent);
    formData.append('replyto', email);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Web3Forms error:', result);
      // Fallback: log the submission (you can set up email forwarding)
      console.log('BusinessHub Lead Submission:', { name, email, phone, company, budget, timeline, project });
      return res.status(200).json({ success: true, message: 'Request received' });
    }
  } catch (error) {
    console.error('Email error:', error);
    // Still return success to user, but log the error
    console.log('BusinessHub Lead Submission (error logged):', { name, email, phone, company, budget, timeline, project });
    return res.status(200).json({ success: true, message: 'Request received' });
  }
}

