const https = require('https');
const querystring = require('querystring');

module.exports = async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    console.log('=== API FUNCTION CALLED ===');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse form data
    const name = String(req.body?.name || '');
    const email = String(req.body?.email || '');
    const phone = String(req.body?.phone || '');
    const company = String(req.body?.company || 'Not provided');
    const budget = String(req.body?.budget || '');
    const timeline = String(req.body?.timeline || '');
    const project = String(req.body?.project || '');
    
    // Validate required fields
    if (!name || !email || !budget || !timeline || !project) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    console.log('Received form data:', { name, email, phone, company, budget, timeline, project });

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
