import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const getStatusText = (status: ComplaintStatus): string => {
  const statusMap: Record<ComplaintStatus, string> = {
    new: 'Новая',
    processing: 'В обработке',
    resolved: 'Решена',
    rejected: 'Отклонена'
  };
  return statusMap[status];
};

const getCategoryText = (category: ComplaintCategory): string => {
  const categoryMap: Record<ComplaintCategory, string> = {
    stadium: 'Стадион',
    team: 'Команда',
    tickets: 'Билеты',
    merchandise: 'Мерч',
    other: 'Другое'
  };
  return categoryMap[category];
};

// Функция для проверки прав администратора
const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

const formatComplaintMessage = (complaint: Complaint) => {
  const statusEmoji = {
    new: '🆕',
    processing: '🔄',
    resolved: '✅',
    rejected: '❌'
  }[complaint.status];

  return `
<b>${statusEmoji} Новая жалоба #${complaint.id}</b>

<b>Категория:</b> ${getCategoryText(complaint.category)}
<b>Описание:</b> ${complaint.description}
<b>Локация:</b> ${complaint.location}
<b>Статус:</b> ${getStatusText(complaint.status)}
<b>Дата создания:</b> ${new Date(complaint.created_at).toLocaleString()}
${complaint.contact_email ? `<b>Email:</b> ${complaint.contact_email}` : ''}
${complaint.contact_phone ? `<b>Телефон:</b> ${complaint.contact_phone}` : ''}
${complaint.attachments?.length ? `\n<b>Вложения:</b> ${complaint.attachments.length}` : ''}
  `.trim();
};

const formatStatusUpdateMessage = (complaint: Complaint) => {
  const statusEmoji = {
    new: '🆕',
    processing: '🔄',
    resolved: '✅',
    rejected: '❌'
  }[complaint.status];

  return `
<b>${statusEmoji} Обновление статуса жалобы #${complaint.id}</b>

<b>Категория:</b> ${getCategoryText(complaint.category)}
<b>Описание:</b> ${complaint.description}
<b>Локация:</b> ${complaint.location}
<b>Новый статус:</b> ${getStatusText(complaint.status)}
<b>Дата обновления:</b> ${new Date(complaint.updated_at).toLocaleString()}
${complaint.response ? `\n<b>Ответ администратора:</b>\n${complaint.response.text}\n\n<b>Администратор:</b> ${complaint.response.adminName || 'Не указан'}` : ''}
  `.trim();
};

const sendPhotoToTelegram = async (photoUrl: string, caption: string) => {
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

export const sendTelegramNotification = async (complaint: Complaint) => {
  // Проверяем, является ли пользователь администратором
  if (!isAdmin()) {
    console.log('Уведомление не отправлено: пользователь не является администратором');
    return false;
  }

  try {
    const message = formatComplaintMessage(complaint);
    
    // Если есть изображения, отправляем первое как фото с подписью
    if (complaint.attachments?.length) {
      const firstImage = complaint.attachments.find(a => a.type === 'image');
      if (firstImage) {
        await sendPhotoToTelegram(firstImage.url, message);
        return true;
      }
    }

    // Если нет изображений или не удалось отправить фото, отправляем текстовое сообщение
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