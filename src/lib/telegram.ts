import { Complaint, ComplaintStatus, ComplaintCategory } from '../types';

const statusEmojis: Record<ComplaintStatus, string> = {
  new: '🆕',
  processing: '🔄',
  resolved: '✅',
  rejected: '❌',
  in_progress: '⏳',
  closed: '🔒'
};

const categoryEmojis: Record<ComplaintCategory, string> = {
  facilities: '🏟️',
  staff: '👨‍💼',
  equipment: '🔧',
  cleanliness: '🧹',
  services: '🛎️',
  safety: '🛡️',
  other: '❓'
};

const TELEGRAM_BOT_TOKEN = '7946049113:AAFtcEqrsJ2GSeJO7BY-NhPkLvU_WfR5aqg';
const TELEGRAM_CHAT_ID = '564786163';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const getStatusText = (status: ComplaintStatus): string => {
  const statusMap: Record<ComplaintStatus, string> = {
    new: 'Новая',
    processing: 'В обработке',
    resolved: 'Решена',
    rejected: 'Отклонена',
    in_progress: 'В процессе',
    closed: 'Закрыта'
  };
  return statusMap[status];
};

export const getCategoryText = (category: ComplaintCategory): string => {
  switch (category) {
    case 'facilities':
      return 'Объекты и инфраструктура';
    case 'staff':
      return 'Персонал';
    case 'equipment':
      return 'Оборудование';
    case 'cleanliness':
      return 'Чистота';
    case 'services':
      return 'Услуги';
    case 'safety':
      return 'Безопасность';
    case 'other':
      return 'Другое';
    default:
      return 'Неизвестная категория';
  }
};

// Функция для проверки прав администратора
const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

const formatComplaintMessage = (complaint: Complaint) => {
  const statusEmoji = statusEmojis[complaint.status];
  const categoryEmoji = categoryEmojis[complaint.category];

  return `
🔔 <b>Новое обращение #${complaint.id}</b>

${categoryEmoji} <b>Категория:</b> ${getCategoryText(complaint.category)}
📝 <b>Описание:</b> ${complaint.description}
📍 <b>Локация:</b> ${complaint.location}
${statusEmoji} <b>Статус:</b> ${getStatusText(complaint.status)}
⏰ <b>Дата создания:</b> ${new Date(complaint.created_at).toLocaleString('ru-RU')}
${complaint.contact_email ? `\n📧 <b>Email:</b> ${complaint.contact_email}` : ''}
${complaint.contact_phone ? `\n📱 <b>Телефон:</b> ${complaint.contact_phone}` : ''}
${complaint.attachments?.length ? `\n📎 <b>Вложения:</b> ${complaint.attachments.length} файл(ов)` : ''}
  `.trim();
};

const formatStatusUpdateMessage = (complaint: Complaint) => {
  const statusEmoji = statusEmojis[complaint.status];
  const categoryEmoji = categoryEmojis[complaint.category];

  return `
🔄 <b>Обновление статуса обращения #${complaint.id}</b>

${categoryEmoji} <b>Категория:</b> ${getCategoryText(complaint.category)}
📝 <b>Описание:</b> ${complaint.description}
📍 <b>Локация:</b> ${complaint.location}
${statusEmoji} <b>Новый статус:</b> ${getStatusText(complaint.status)}
⏰ <b>Дата обновления:</b> ${new Date(complaint.updated_at).toLocaleString('ru-RU')}
${complaint.response ? `\n💬 <b>Ответ администратора:</b>\n${complaint.response.text}\n\n👨‍💼 <b>Администратор:</b> ${complaint.response.adminName}` : ''}
  `.trim();
};

export const sendPhotoToTelegram = async (photoUrl: string, caption: string) => {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send photo to Telegram');
    }

    return true;
  } catch (error) {
    console.error('Error sending photo to Telegram:', error);
    return false;
  }
};

export const sendTelegramNotification = async (complaint: Complaint, action: 'created' | 'updated') => {
  try {
    const message = action === 'created' 
      ? formatComplaintMessage(complaint)
      : formatStatusUpdateMessage(complaint);

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}; 