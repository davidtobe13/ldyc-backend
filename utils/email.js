// // utils/email.js
// const nodemailer = require('nodemailer');
// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// // Configure email transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_SECURE === 'true',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// // Generate ID card as PDF
// exports.generateIDCard = async (user) => {
//   try {
//     // Create folder if it doesn't exist
//     const uploadDir = path.join(__dirname, '../uploads/idcards');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const filePath = path.join(
//       uploadDir, 
//       `${user.registrationCode.replace(/[^\w]/g, '_')}.pdf`
//     );

//     // Create a PDF document
//     const doc = new PDFDocument({
//       size: [340, 540], // ID card size (credit card format)
//       margin: 20
//     });

//     // Pipe output to file
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     // Add header
//     doc.fontSize(14).text('LDYC 2025 CAMP', { align: 'center' });
//     doc.moveDown();
    
//     // Add participant info
//     doc.fontSize(12);
    
//     // If we have a photo, add it
//     if (user.photoUrl) {
//       try {
//         doc.image(user.photoUrl, doc.page.width / 2 - 50, doc.y, {
//           fit: [100, 100],
//           align: 'center'
//         });
//         doc.moveDown(5);
//       } catch (err) {
//         console.error('Error adding photo to ID card:', err);
//         // Continue without the photo
//         doc.text('Photo not available', { align: 'center' });
//         doc.moveDown();
//       }
//     } else {
//       doc.text('Photo not available', { align: 'center' });
//       doc.moveDown();
//     }
    
//     // Add participant details
//     doc.text(`Name: ${user.title} ${user.firstName} ${user.surname}`, { align: 'left' });
//     doc.text(`Type: ${user.userType === 'camper' ? 'Camper' : 'Chaplain'}`, { align: 'left' });
//     doc.text(`Archdeaconry: ${user.archdeaconry}`, { align: 'left' });
//     doc.text(`Parish: ${user.parish}`, { align: 'left' });
//     doc.text(`Registration ID: ${user.registrationCode}`, { align: 'left' });
//     doc.moveDown();
    
//     // Add QR code
//     if (user.qrCode) {
//       try {
//         // QR code is stored as data URL, need to extract base64 part
//         const qrData = user.qrCode.split(',')[1];
//         const qrBuffer = Buffer.from(qrData, 'base64');
        
//         doc.image(qrBuffer, doc.page.width / 2 - 50, doc.y, {
//           fit: [100, 100],
//           align: 'center'
//         });
//         doc.moveDown();
//       } catch (err) {
//         console.error('Error adding QR code to ID card:', err);
//         doc.text('QR code not available', { align: 'center' });
//         doc.moveDown();
//       }
//     } else {
//       doc.text('QR code not available', { align: 'center' });
//       doc.moveDown();
//     }
    
//     // Add footer
//     doc.fontSize(8).text('This ID card must be worn at all times during the camp.', { align: 'center' });
    
//     // Finalize PDF file
//     doc.end();
    
//     // Wait for the stream to finish
//     return new Promise((resolve, reject) => {
//       stream.on('finish', () => {
//         // Return file path relative to server URL
//         const idCardUrl = `/uploads/idcards/${path.basename(filePath)}`;
//         resolve(idCardUrl);
//       });
      
//       stream.on('error', reject);
//     });
//   } catch (error) {
//     console.error('ID card generation error:', error);
//     throw new Error('Failed to generate ID card');
//   }
// };

// // Send registration confirmation email
// exports.sendRegistrationEmail = async (email, registrationCode, qrCode, idCardUrl) => {
//   try {
//     const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
//     const idCardFullUrl = `${serverUrl}${idCardUrl}`;
    
//     // Email content
//     const mailOptions = {
//       from: `"LDYC 2025 Camp" <${process.env.EMAIL_FROM}>`,
//       to: email,
//       subject: 'Your Registration Confirmation',
//       html: `
//         <h2>Registration Successful!</h2>
//         <p>Thank you for registering for the LDYC 2025 Camp.</p>
//         <p>Your registration code is: <strong>${registrationCode}</strong></p>
//         <p>Please keep this code safe as you'll need it for check-in and throughout the camp.</p>
//         <p>Your ID card is attached to this email. Please print it and bring it with you.</p>
//         <p>You can also download your ID card <a href="${idCardFullUrl}">here</a>.</p>
//         <p>See you at the camp!</p>
//       `,
//       attachments: [
//         {
//           filename: 'id-card.pdf',
//           path: `${serverUrl}${idCardUrl}`,
//           contentType: 'application/pdf'
//         }
//       ]
//     };
    
//     // Send email
//     await transporter.sendMail(mailOptions);
    
//     return true;
//   } catch (error) {
//     console.error('Email sending error:', error);
//     throw new Error('Failed to send registration email');
//   }
// };



// // utils/email.js
// const nodemailer = require('nodemailer');
// const fs = require('fs');
// const path = require('path');

// // Configure email transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_SECURE === 'true',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

// // Generate ID card as HTML
// exports.generateIDCard = async (user) => {
//   try {
//     // Create folder if it doesn't exist
//     const uploadDir = path.join(__dirname, '../uploads/idcards');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     const fileName = `${user.registrationCode.replace(/[^\w]/g, '_')}.html`;
//     const filePath = path.join(uploadDir, fileName);
    
//     // Create HTML content
//     const htmlContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>LDYC 2025 Camp ID Card</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           margin: 0;
//           padding: 0;
//           background-color: #f5f5f5;
//         }
//         .id-card {
//           width: 340px;
//           height: 540px;
//           background-color: white;
//           border-radius: 10px;
//           box-shadow: 0 4px 8px rgba(0,0,0,0.1);
//           margin: 20px auto;
//           padding: 20px;
//           box-sizing: border-box;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }
//         .header {
//           color: #003366;
//           font-size: 16px;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 15px;
//           width: 100%;
//           border-bottom: 2px solid #003366;
//           padding-bottom: 10px;
//         }
//         .photo-container {
//           width: 120px;
//           height: 120px;
//           border-radius: 50%;
//           overflow: hidden;
//           margin: 10px 0;
//           border: 2px solid #003366;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background-color: #e9e9e9;
//         }
//         .photo {
//           width: 100%;
//           height: auto;
//         }
//         .details {
//           width: 100%;
//           margin: 15px 0;
//         }
//         .details p {
//           margin: 5px 0;
//           font-size: 14px;
//         }
//         .details strong {
//           color: #003366;
//         }
//         .qr-container {
//           margin: 10px 0;
//         }
//         .qr-code {
//           width: 100px;
//           height: 100px;
//         }
//         .footer {
//           font-size: 10px;
//           text-align: center;
//           color: #666;
//           margin-top: auto;
//           width: 100%;
//           border-top: 1px solid #ccc;
//           padding-top: 10px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="id-card">
//         <div class="header">LDYC 2025</div>
        
//         <div class="photo-container">
//           ${user.photoUrl 
//             ? `<img src="${user.photoUrl}" alt="Participant Photo" class="photo">` 
//             : `<p>Photo not available</p>`}
//         </div>
        
//         <div class="details">
//           <p><strong>Name:</strong> ${user.title} ${user.firstName} ${user.surname}</p>
//           <p><strong>Type:</strong> ${user.userType === 'camper' ? 'Camper' : 'Chaplain'}</p>
//           <p><strong>Archdeaconry:</strong> ${user.archdeaconry}</p>
//           <p><strong>Parish:</strong> ${user.parish}</p>
//           <p><strong>Registration ID:</strong> ${user.registrationCode}</p>
//         </div>
        
//         <div class="qr-container">
//           ${user.qrCode 
//             ? `<img src="${user.qrCode}" alt="QR Code" class="qr-code">` 
//             : `<p>QR code not available</p>`}
//         </div>
        
//         <div class="footer">
//           This ID card must be worn at all times during the camp.
//         </div>
//       </div>
//     </body>
//     </html>
//     `;
    
//     // Write HTML to file
//     fs.writeFileSync(filePath, htmlContent);
    
//     // Return file path relative to server URL
//     const idCardUrl = `/uploads/idcards/${fileName}`;
//     return idCardUrl;
//   } catch (error) {
//     console.error('ID card generation error:', error);
//     throw new Error('Failed to generate ID card');
//   }
// };

// // Send registration confirmation email
// exports.sendRegistrationEmail = async (email, registrationCode, qrCode, idCardUrl) => {
//   try {
//     const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
//     const idCardFullUrl = `${serverUrl}${idCardUrl}`;
    
//     // Email content
//     const mailOptions = {
//       from: `"LDYC 2025" <${process.env.EMAIL_FROM}>`,
//       to: email,
//       subject: 'Your Registration Confirmation',
//       html: `
//         <h2>Registration Successful!</h2>
//         <p>Thank you for registering for the LDYC 2025.</p>
//         <p>Your registration code is: <strong>${registrationCode}</strong></p>
//         <p>Please keep this code safe as you'll need it for check-in and throughout the camp.</p>
//         <p>Your digital ID card is available <a href="${idCardFullUrl}">here</a>.</p>
//         <p>You can show this ID on your mobile device or print it and bring it with you.</p>
//         <p>See you at the camp!</p>
//       `,
//       // Note: We're no longer attaching a PDF, instead providing a link to the HTML ID card
//     };
    
//     // Send email
//     await transporter.sendMail(mailOptions);
    
//     return true;
//   } catch (error) {
//     console.error('Email sending error:', error);
//     throw new Error('Failed to send registration email');
//   }
// };



// utils/email.js
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send registration confirmation email with embedded details and QR code
exports.sendRegistrationEmail = async (user) => {
  try {
    const { email, registrationCode, qrCode, firstName, surname, title, userType, archdeaconry, parish } = user;
    
    // Email content with inline styled HTML
    const mailOptions = {
      from: `"LAGOS DIOCESE DIRECTORATE OF YOUTHS" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Registration Confirmation',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LDYC 2025 Registration</title>
          <style>
            .container {
              padding: 20px;
              text-align: center;
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .header {
              background-color: #003366;
              color: white;
              padding: 15px;
              border-radius: 8px 8px 0 0;
              margin: -20px -20px 20px -20px;
            }
            .registration-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: left;
            }
            .registration-code {
              font-size: 24px;
              font-weight: bold;
              color: #003366;
              padding: 10px;
              background-color: #e9f0f7;
              border-radius: 4px;
              display: inline-block;
              margin: 10px 0;
            }
            .qr-container {
              margin: 20px 0;
            }
            .qr-code {
              width: 150px;
              height: 150px;
            }
            .details {
              margin: 15px 0;
              text-align: left;
            }
            .details p {
              margin: 5px 0;
              padding: 5px 0;
              border-bottom: 1px solid #eee;
            }
            .details strong {
              color: #003366;
              min-width: 120px;
              display: inline-block;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #888888;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>LDYC CAMP 2025</h2>
            </div>
            
            <h3>Registration Confirmation</h3>
            <p>Thank you for registering for the LYDC Camp. Your registration has been successfully processed.</p>
            
            <div class="registration-info">
              <p>Your Registration Code:</p>
              <div class="registration-code">${registrationCode}</div>
              <p>Please keep this code safe as you'll need it for check-in and throughout the camp.</p>
            </div>
            
            <div class="details">
              <h4>Participant Details:</h4>
              <p><strong>Name:</strong> ${title} ${firstName} ${surname}</p>
              <p><strong>Type:</strong> ${userType === 'camper' ? 'Camper' : 'Chaplain'}</p>
              <p><strong>Archdeaconry:</strong> ${archdeaconry}</p>
              <p><strong>Parish:</strong> ${parish}</p>
            </div>
            
            <div class="qr-container">
              <p>Scan this QR code for quick access to your details:</p>
              ${qrCode 
                ? `<img src="${qrCode}" alt="QR Code" class="qr-code">` 
                : `<p>QR code not available</p>`}
            </div>
            
            <p>Please present this email or your registration code when you arrive at the camp.</p>
            
            <div class="footer">
              <p>If you have any questions, please contact us at ${process.env.EMAIL_FROM}.</p>
              <p>We look forward to seeing you at the camp!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send registration email');
  }
};

