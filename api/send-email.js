const https = require('https');
const querystring = require('querystring');

module.exports = async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    console.log('=== API FUNCTION CALLED ===');
    console.log('Method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Vercel automatically parses FormData, but let's be explicit
    let body = req.body;
    
    // If body is a string (shouldn't happen, but just in case)
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // If not JSON, try parsing as URL-encoded
        body = querystring.parse(body);
      }
    }
    
    console.log('Raw body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body || {}));
    
    // Extract form fields - handle both object and parsed form data
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const phone = String(body?.phone || '').trim();
    const company = String(body?.company || 'Not provided').trim();
    const budget = String(body?.budget || '').trim();
    const timeline = String(body?.timeline || '').trim();
    const project = String(body?.project || '').trim();
    
    console.log('Parsed form data:', { name, email, phone, company, budget, timeline, project });
    
    // Validate required fields
    if (!name || !email || !budget || !timeline || !project) {
      console.error('Validation failed - missing fields:', {
        hasName: !!name,
        hasEmail: !!email,
        hasBudget: !!budget,
        hasTimeline: !!timeline,
        hasProject: !!project
      });
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields. Please fill in: ${!name ? 'Name, ' : ''}${!email ? 'Email, ' : ''}${!budget ? 'Budget, ' : ''}${!timeline ? 'Timeline, ' : ''}${!project ? 'Project Description' : ''}`.replace(/,\s*$/, '')
      });
    }

    const emailContent = `New BusinessHub Lead:

Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}
Budget: ${budget}
Timeline: ${timeline}
Project Description: ${project}

Submitted: ${new Date().toLocaleString()}`;

    // Send via Web3Forms using Node.js https module
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

    const postData = querystring.stringify(web3formsData);

    return new Promise((resolve) => {
      const options = {
        hostname: 'api.web3forms.com',
        path: '/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const web3Req = https.request(options, (web3Res) => {
        let data = '';
        
        web3Res.on('data', (chunk) => {
          data += chunk;
        });
        
        web3Res.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log('Web3Forms response:', result);
            
            if (result.success === true) {
              return resolve(res.status(200).json({ 
                success: true, 
                message: 'Email sent successfully to partners.clearhub@gmail.com' 
              }));
            } else {
              console.error('Web3Forms failed:', result);
              return resolve(res.status(500).json({ 
                success: false, 
                message: 'Failed to send email. Please email partners.clearhub@gmail.com directly.' 
              }));
            }
          } catch (parseError) {
            console.error('Parse error:', parseError);
            return resolve(res.status(500).json({ 
              success: false, 
              message: 'Error processing response. Please email partners.clearhub@gmail.com directly.' 
            }));
          }
        });
      });

      web3Req.on('error', (error) => {
        console.error('Request error:', error);
        return resolve(res.status(500).json({ 
          success: false, 
          message: `Network error: ${error.message}. Please email partners.clearhub@gmail.com directly.` 
        }));
      });

      web3Req.write(postData);
      web3Req.end();
    });
  } catch (error) {
    console.error('Function error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${error.message}. Please email partners.clearhub@gmail.com directly.` 
    });
  }
}
