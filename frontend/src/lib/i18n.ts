import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      'send': 'Send',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'save': 'Save',
      'search': 'Search',
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'confirm': 'Confirm',
      'close': 'Close',

      // Chat Interface
      'chat.title': 'Communications',
      'chat.search.placeholder': 'Search conversations...',
      'chat.input.placeholder': 'Type your message...',
      'chat.input.file': 'Attach file',
      'chat.input.voice': 'Record voice message',
      'chat.input.location': 'Share location',
      'chat.input.emoji': 'Add emoji',
      'chat.empty': 'No messages yet. Start the conversation!',
      'chat.typing': '{{name}} is typing...',
      'chat.online': 'Online',
      'chat.offline': 'Offline',
      'chat.lastSeen': 'Last seen {{time}}',

      // Chat Rooms
      'chat.rooms.general': 'General Discussion',
      'chat.rooms.admin': 'Admin Channel',
      'chat.rooms.agents': 'Field Agents',
      'chat.rooms.suppliers': 'Suppliers Hub',
      'chat.rooms.buyers': 'Buyers Forum',
      'chat.rooms.support': 'Customer Support',
      'chat.rooms.announcements': 'Announcements',

      // File Sharing
      'chat.file.upload': 'Upload File',
      'chat.file.uploading': 'Uploading...',
      'chat.file.error': 'Failed to upload file',
      'chat.file.size.limit': 'File size limit exceeded (Max: 10MB)',
      'chat.file.type.error': 'File type not supported',
      'chat.file.download': 'Download',

      // Voice Messages
      'chat.voice.record': 'Hold to record',
      'chat.voice.recording': 'Recording...',
      'chat.voice.stop': 'Release to send',
      'chat.voice.cancel': 'Slide to cancel',
      'chat.voice.play': 'Play',
      'chat.voice.pause': 'Pause',
      'chat.voice.duration': '{{duration}}s',

      // Message Actions
      'chat.message.reply': 'Reply',
      'chat.message.forward': 'Forward',
      'chat.message.delete': 'Delete',
      'chat.message.flag': 'Flag',
      'chat.message.unflag': 'Unflag',
      'chat.message.copy': 'Copy',
      'chat.message.translate': 'Translate',
      'chat.message.delivered': 'Delivered',
      'chat.message.read': 'Read',
      'chat.message.failed': 'Failed to send',

      // Settings
      'chat.settings.title': 'Chat Settings',
      'chat.settings.language': 'Language',
      'chat.settings.autoTranslate': 'Auto-translate messages',
      'chat.settings.notifications': 'Notifications',
      'chat.settings.soundNotifications': 'Sound notifications',
      'chat.settings.quietHours': 'Quiet hours',
      'chat.settings.theme': 'Chat theme',

      // Conversation Templates
      'chat.templates.title': 'Quick Responses',
      'chat.templates.greeting': 'Hello! How can I help you?',
      'chat.templates.thanks': 'Thank you for your message.',
      'chat.templates.followUp': 'I\'ll follow up with you shortly.',
      'chat.templates.resolved': 'This issue has been resolved.',
      'chat.templates.custom': 'Create custom template',

      // Notifications
      'chat.notifications.newMessage': 'New message from {{name}}',
      'chat.notifications.newRoom': 'You were added to {{room}}',
      'chat.notifications.mention': '{{name}} mentioned you',
      'chat.notifications.fileShared': '{{name}} shared a file',
    }
  },
  si: {
    translation: {
      // Common - Sinhala
      'send': 'යවන්න',
      'cancel': 'අවලංගු කරන්න',
      'delete': 'මකන්න',
      'edit': 'සංස්කරණය කරන්න',
      'save': 'සුරකින්න',
      'search': 'සොයන්න',
      'loading': 'පූරණය වෙමින්...',
      'error': 'දෝෂයක්',
      'success': 'සාර්ථකයි',
      'confirm': 'තහවුරු කරන්න',
      'close': 'වසන්න',

      // Chat Interface - Sinhala
      'chat.title': 'සන්නිවේදන',
      'chat.search.placeholder': 'සංවාද සොයන්න...',
      'chat.input.placeholder': 'ඔබේ පණිවිඩය ටයිප් කරන්න...',
      'chat.input.file': 'ගොනුව අමුණන්න',
      'chat.input.voice': 'හඬ පණිවිඩය පටිගත කරන්න',
      'chat.input.location': 'ස්ථානය බෙදාගන්න',
      'chat.input.emoji': 'ඉමෝජි එකතු කරන්න',
      'chat.empty': 'තවම පණිවිඩ නැත. සංවාදය ආරම්භ කරන්න!',
      'chat.typing': '{{name}} ටයිප් කරමින්...',
      'chat.online': 'සබැඳි',
      'chat.offline': 'නොසබැඳි',
      'chat.lastSeen': 'අවසන් වරට දැක්කේ {{time}}',

      // Chat Rooms - Sinhala
      'chat.rooms.general': 'සාමාන්‍ය සාකච්ඡාව',
      'chat.rooms.admin': 'පරිපාලක නාලිකාව',
      'chat.rooms.agents': 'ක්ෂේත්‍ර නියෝජිතයන්',
      'chat.rooms.suppliers': 'සැපයුම්කරු මධ්‍යස්ථානය',
      'chat.rooms.buyers': 'ගැනුම්කරු සභාව',
      'chat.rooms.support': 'පාරිභෝගික සහාය',
      'chat.rooms.announcements': 'නිවේදන',

      // File Sharing - Sinhala
      'chat.file.upload': 'ගොනුව උඩුගත කරන්න',
      'chat.file.uploading': 'උඩුගත කරමින්...',
      'chat.file.error': 'ගොනුව උඩුගත කිරීම අසාර්ථක විය',
      'chat.file.size.limit': 'ගොනු ප්‍රමාණ සීමාව ඉක්මවා ගියේය (උපරිමය: 10MB)',
      'chat.file.type.error': 'ගොනු වර්ගය සහාය නොදක්වයි',
      'chat.file.download': 'බාගන්න',

      // Voice Messages - Sinhala
      'chat.voice.record': 'පටිගත කිරීමට අල්ලාගෙන සිටින්න',
      'chat.voice.recording': 'පටිගත කරමින්...',
      'chat.voice.stop': 'යවන්න සඳහා මුදාහරින්න',
      'chat.voice.cancel': 'අවලංගු කිරීමට ලිස්සා යන්න',
      'chat.voice.play': 'වාදනය කරන්න',
      'chat.voice.pause': 'නවතන්න',
      'chat.voice.duration': 'තප්පර {{duration}}',
    }
  },
  ta: {
    translation: {
      // Common - Tamil
      'send': 'அனுப்பு',
      'cancel': 'ரத்து செய்',
      'delete': 'நீக்கு',
      'edit': 'திருத்து',
      'save': 'சேமி',
      'search': 'தேடு',
      'loading': 'ஏற்றுகிறது...',
      'error': 'பிழை',
      'success': 'வெற்றி',
      'confirm': 'உறுதிப்படுத்து',
      'close': 'மூடு',

      // Chat Interface - Tamil
      'chat.title': 'தகவல்தொடர்பு',
      'chat.search.placeholder': 'உரையாடல்களைத் தேடு...',
      'chat.input.placeholder': 'உங்கள் செய்தியைத் தட்டச்சு செய்யுங்கள்...',
      'chat.input.file': 'கோப்பை இணைக்கவும்',
      'chat.input.voice': 'குரல் செய்தியைப் பதிவு செய்யுங்கள்',
      'chat.input.location': 'இடத்தைப் பகிரவும்',
      'chat.input.emoji': 'எமோஜி சேர்க்கவும்',
      'chat.empty': 'இன்னும் செய்திகள் இல்லை. உரையாடலைத் தொடங்குங்கள்!',
      'chat.typing': '{{name}} தட்டச்சு செய்கிறார்...',
      'chat.online': 'ஆன்லைனில்',
      'chat.offline': 'ஆஃப்லைனில்',
      'chat.lastSeen': 'கடைசியாக பார்த்தது {{time}}',

      // Chat Rooms - Tamil
      'chat.rooms.general': 'பொது விவாதம்',
      'chat.rooms.admin': 'நிர்வாக சேனல்',
      'chat.rooms.agents': 'கள முகவர்கள்',
      'chat.rooms.suppliers': 'சப்ளையர் மையம்',
      'chat.rooms.buyers': 'வாங்குபவர் மன்றம்',
      'chat.rooms.support': 'வாடிக்கையாளர் ஆதரவு',
      'chat.rooms.announcements': 'அறிவிப்புகள்',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
