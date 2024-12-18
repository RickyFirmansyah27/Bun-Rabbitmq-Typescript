import { Logger } from "../helper";
import { UserCreateRequestEmail } from "../utils/mailer";

type MessagePayload = Record<string, unknown>;

export const handleCreateUser = async (payload: MessagePayload): Promise<void> => {
  Logger.info('Processing payload:', payload);
  try {
    await UserCreateRequestEmail('aicorex4@gmail.com');
    Logger.info('Email sent successfully.');
  } catch (error) {
    Logger.error('Error sending email:', error);
  }
};
