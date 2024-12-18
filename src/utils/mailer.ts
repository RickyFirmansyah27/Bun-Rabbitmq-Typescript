import { Logger } from '../helper';
import { UserCreateRequest, transporter } from './smtp';

export const UserCreateRequestEmail = async (email: string): Promise<void> => {
  const mailOptions = {
    from: 'aicorex2@gmail.com',
    to: email,
    subject: "User Create - Request",
    html: UserCreateRequest,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    Logger.info("Email sent:", info.response);
  } catch (error) {
    Logger.error("Error:", error);
    throw error;
  }
};
