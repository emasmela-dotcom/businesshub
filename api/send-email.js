module.exports = async function handler(req, res) {
  // Log IMMEDIATELY - before anything else
  console.log('=== FUNCTION STARTED ===');
  console.log('Timestamp:', new Date().toISOString());
  
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    console.log('=== API FUNCTION CALLED ===');
    console.log('Method:', req.method);
    try {
      console.log('Headers:', JSON.stringify(req.headers || {}));
    } catch (e) {
      console.log('Headers: [could not stringify]');
    }
    console.log('Body type:', typeof req.body);
    try {
      console.log('Body:', req.body ? JSON.stringify(req.body) : 'null/undefined');
    } catch (e) {
      console.log('Body: [could not stringify]');
    }
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse form data - handle both JSON and FormData
    let name, email, phone, company, budget, timeline, project;
    
    if (req.headers['content-type']?.includes('application/json')) {
      ({ name, email, phone, company, budget, timeline, project } = req.body);
    } else {
      // Handle FormData - Vercel automatically parses it
      name = req.body?.name;
      email = req.body?.email;
      phone = req.body?.phone;
      company = req.body?.company;
      budget = req.body?.budget;
      timeline = req.body?.timeline;
      project = req.body?.project;
    }
    
    // Validate required fields
    if (!name || !email || !budget || !timeline || !project) {
      console.error('Missing required fields:', { name, email, budget, timeline, project });
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, email, budget, timeline, and project are required.' 
      });
    }
    
    // Ensure all variables are strings to prevent template errors
    name = String(name || '');
    email = String(email || '');
    phone = String(phone || '');
    company = String(company || 'Not provided');
    budget = String(budget || '');
    timeline = String(timeline || '');
    project = String(project || '');
    
    console.log('Received form data:', { name, email, phone, company, budget, timeline, project });

  const emailContent = `New BusinessHub Lead:

Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'Not provided'}
Budget: ${budget}
Timeline: ${timeline}
Project Description: ${project}

Submitted: ${new Date().toLocaleString()}`;

  // Log submission
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

  // Try email services one by one until one works
  let emailSent = false;

  // TRY 1: Formspree (simplest, no API key needed)
  if (!emailSent) {
    try {
      console.log('🔄 Trying Formspree...');
      const formspreeData = new URLSearchParams();
      formspreeData.append('name', name);
      formspreeData.append('email', email);
      formspreeData.append('phone', phone);
      formspreeData.append('company', company || 'Not provided');
      formspreeData.append('budget', budget);
      formspreeData.append('timeline', timeline);
      formspreeData.append('project', project);
      formspreeData.append('_to', 'partners.clearhub@gmail.com');
      formspreeData.append('_subject', `New BusinessHub Lead - ${name}`);

      const response = await fetch('https://formspree.io/f/xrbvnnjy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formspreeData.toString(),
      });

      const formspreeText = await response.text();
      console.log('Formspree HTTP status:', response.status);
      console.log('Formspree response (first 500 chars):', formspreeText.substring(0, 500));
      
      // Formspree returns HTML success page on success, JSON error on failure
      if (response.ok && (formspreeText.includes('Thank you') || formspreeText.includes('success'))) {
        emailSent = true;
        console.log('✅ Email sent via Formspree');
      } else {
        console.error('❌ Formspree failed. Status:', response.status);
        console.error('Formspree response:', formspreeText.substring(0, 200));
      }
    } catch (error) {
      console.error('❌ Formspree exception:', error.message);
    }
  }

  // TRY 2: Web3Forms (if Formspree failed)
  if (!emailSent) {
    try {
      console.log('🔄 Trying Web3Forms...');
      const web3formsData = {
        access_key: '9f6ac12b-93eb-463c-9d70-61d3781e5518',
        subject: `New BusinessHub Lead - ${name}`,
        from_name: 'BusinessHub Platform',
        email: email,
        to: 'partners.clearhub@gmail.com',
        message: emailContent,
        name: name,
        replyto: email
      };
      
      const params = new URLSearchParams();
      Object.keys(web3formsData).forEach(key => {
        params.append(key, web3formsData[key]);
      });
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const result = await response.json();
      console.log('Web3Forms full response:', JSON.stringify(result, null, 2));
      
      if (result.success === true) {
        emailSent = true;
        console.log('✅ Email sent successfully via Web3Forms');
      } else {
        const errorMsg = result.message || JSON.stringify(result);
        console.error('❌ Web3Forms failed:', errorMsg);
      }
    } catch (error) {
      console.error('❌ Web3Forms exception:', error.message);
    }
  }

  // TRY 3: Resend (if both above failed and API key is set)
  if (!emailSent) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        console.log('🔄 Trying Resend...');
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'BusinessHub <onboarding@resend.dev>',
            to: 'partners.clearhub@gmail.com',
            subject: `New BusinessHub Lead - ${name}`,
            html: `
              <h2>New BusinessHub Lead</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Company:</strong> ${company || 'Not provided'}</p>
              <p><strong>Budget:</strong> ${budget}</p>
              <p><strong>Timeline:</strong> ${timeline}</p>
              <p><strong>Project Description:</strong></p>
              <p>${project.replace(/\n/g, '<br>')}</p>
              <p><em>Submitted: ${new Date().toLocaleString()}</em></p>
            `,
            reply_to: email
          })
        });

        const resendResult = await resendResponse.json();
        console.log('Resend response status:', resendResponse.status);
        console.log('Resend response:', JSON.stringify(resendResult, null, 2));

        if (resendResponse.ok && resendResult.id) {
          emailSent = true;
          console.log('✅ Email sent successfully via Resend');
        } else {
          console.error('❌ Resend failed:', resendResult);
        }
      } catch (error) {
        console.error('❌ Resend exception:', error.message);
      }
    } else {
      console.log('⏭️  Skipping Resend - API key not set');
    }
  }

    // Log final status
    console.log('=== FINAL EMAIL STATUS ===');
    console.log('emailSent:', emailSent);
    console.log('========================');

    if (!emailSent) {
      console.error('❌ FAILED TO SEND EMAIL - All services failed');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email. Please check Vercel logs and email partners.clearhub@gmail.com directly.',
        emailSent: false
      });
    }

    // Only return success if we're 100% sure email was sent
    console.log('✅ Returning success - email was confirmed sent');
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully to partners.clearhub@gmail.com',
      emailSent: true
    });
  } catch (error) {
    console.error('❌ FUNCTION ERROR:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}. Please email partners.clearhub@gmail.com directly.`,
      error: error.message
    });
  }
}

