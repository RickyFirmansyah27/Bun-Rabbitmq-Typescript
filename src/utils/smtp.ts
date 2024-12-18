import nodemailer from 'nodemailer';

// export const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASS,
//     }
// });

export const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "5578a4ddc024a1",
      pass: "522543e39b185f"
    }
  });

export const UserCreateRequest = `
<p>Dear User,</p>

<p>Your registration request is currently being processed.</p>

<p>We will notify you as soon as the process is complete. If you have any questions, feel free to contact our support team.</p>

<p>Best regards,</p>
<p>The Bun-Mono-App Team</p>
`;
  