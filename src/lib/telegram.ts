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
  const date = complaint.submittedat || complaint.created_at;
  return `
🔔 <b>Новое обращение</b>

📅 <b>Дата:</b> ${new Date(date).toLocaleString('ru-RU')}
📝 <b>Тема:</b> ${complaint.title || 'Без темы'}
${categoryEmojis[complaint.category]} <b>Категория:</b> ${getCategoryText(complaint.category)}
ℹ️ <b>Описание:</b> ${complaint.description}
${complaint.contact_phone ? `\n📱 <b>Телефон:</b> ${complaint.contact_phone}` : ''}
${complaint.contact_email ? `\n📧 <b>Email:</b> ${complaint.contact_email}` : ''}
  `.trim();
};

const formatStatusUpdateMessage = (complaint: Complaint) => {
  const date = complaint.submittedat || complaint.created_at;
  return `
${complaint.response ? `
💬 <b>Ответ на обращение</b>

📅 <b>Дата обращения:</b> ${new Date(date).toLocaleString('ru-RU')}
📝 <b>Тема:</b> ${complaint.title || 'Без темы'}
ℹ️ <b>Описание:</b> ${complaint.description}

✍️ <b>Ответ администратора:</b>
${complaint.response.text}

👨‍💼 ${complaint.response.adminName}
⏰ ${new Date(complaint.response.respondedAt).toLocaleString('ru-RU')}` : 
`🔄 <b>Статус обновлен</b>

📅 <b>Дата:</b> ${new Date(complaint.updated_at).toLocaleString('ru-RU')}
📝 <b>Тема:</b> ${complaint.title || 'Без темы'}
${statusEmojis[complaint.status]} <b>Новый статус:</b> ${getStatusText(complaint.status)}`}
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

    // Сначала отправляем текстовое сообщение
    const messageResponse = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
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

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      console.error('Telegram API error:', errorData);
      return false;
    }

    // Если есть вложения, отправляем их
    if (complaint.attachments && complaint.attachments.length > 0) {
      for (const attachment of complaint.attachments) {
        if (attachment.startsWith('data:image')) {
          await sendPhotoToTelegram(attachment, 'Вложение к обращению');
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}; 