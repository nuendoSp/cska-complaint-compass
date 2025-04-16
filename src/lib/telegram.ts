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
  service_quality: '⭐',
  other: '❓'
};

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
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
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials not configured');
    return;
  }

  let message = '';
  if (action === 'created') {
    message = formatComplaintMessage(complaint);
  } else if (action === 'updated') {
    message = formatStatusUpdateMessage(complaint);
  }

  try {
    console.log('Sending Telegram notification:', {
      botToken,
      chatId,
      message
    });

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
};

export const sendStatusUpdateNotification = async (complaint: Complaint) => {
  // Проверяем, является ли пользователь администратором
  if (!isAdmin()) {
    console.log('Уведомление не отправлено: пользователь не является администратором');
    return false;
  }

  try {
    const message = formatStatusUpdateMessage(complaint);
    
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram notification');
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
};

export const testTelegramNotification = async () => {
  try {
    const testMessage = `
<b>🧪 Тестовое сообщение</b>

Это тестовое сообщение для проверки работы уведомлений.
Время отправки: ${new Date().toLocaleString('ru-RU')}
    `;

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send Telegram notification: ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending test Telegram notification:', error);
    return false;
  }
}; 