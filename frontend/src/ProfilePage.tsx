import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building2, 
  Mail, 
  ArrowLeft,
  Save,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
  Shield,
  X,
  Lock,
  Key
} from 'lucide-react';

interface AgencyData {
  name: string;
  address: string;
  city: string;
  country: string;
  telegram?: string;
  whatsapp?: string;
  vk?: string;
  status: 'none' | 'pending' | 'approved';
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [agencyData, setAgencyData] = useState<AgencyData>(() => {
    const saved = localStorage.getItem(`agencyData_${user?.id}`);
    return saved ? JSON.parse(saved) : {
      name: '',
      address: '',
      city: '',
      country: '',
      telegram: '',
      whatsapp: '',
      vk: '',
      status: 'none'
    };
  });
  
  const [activeTab, setActiveTab] = useState<'profile' | 'agency'>('profile');
  const [saveMessage, setSaveMessage] = useState('');
  
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAgencyChange = (field: string, value: string) => {
    setAgencyData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleProfileSave = () => {
    setSaveMessage('Профиль успешно обновлен!');
    setTimeout(() => setSaveMessage(''), 3000);
  };
  
  const handleAgencySubmit = () => {
    const updatedAgency = { ...agencyData, status: 'pending' as const };
    setAgencyData(updatedAgency);
    localStorage.setItem(`agencyData_${user?.id}`, JSON.stringify(updatedAgency));
    setSaveMessage('Заявка отправлена на рассмотрение!');
    setTimeout(() => setSaveMessage(''), 3000);
  };
  
  const isAgencyFormValid = agencyData.name && agencyData.address && 
                            agencyData.city && agencyData.country &&
                            (agencyData.telegram || agencyData.whatsapp || agencyData.vk);
  
  const tabs = [
    { id: 'profile' as const, label: 'Профиль', icon: User },
    { id: 'agency' as const, label: 'Агентство', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-black text-neutral-200 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative border-b border-white/10 bg-black/40 backdrop-blur-xl z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.button 
              whileHover={{ x: -5 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-all group"
            >
              <div className="p-2 bg-white/5 group-hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">Назад</span>
            </motion.button>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white flex items-center gap-3"
            >
              <Sparkles className="h-8 w-8" />
              Личный кабинет
            </motion.h1>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { logout(); navigate('/login'); }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white transition-all"
            >
              Выйти
            </motion.button>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        {/* Save Message */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="mb-8 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 flex items-center gap-4 shadow-2xl"
            >
              <div className="p-3 bg-white rounded-xl">
                <Check className="h-6 w-6 text-black" />
              </div>
              <span className="text-white font-medium text-lg">{saveMessage}</span>
              <button onClick={() => setSaveMessage('')} className="ml-auto text-neutral-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="size-24 rounded-2xl bg-gradient-to-br from-white to-neutral-300 grid place-items-center text-4xl font-bold text-black shadow-xl"
            >
              {user?.name?.charAt(0).toUpperCase()}
            </motion.div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
              <p className="text-neutral-400 flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              {agencyData.status === 'pending' && (
                <div className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-xl border border-white/20 w-fit">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Заявка на агентство на рассмотрении</span>
                </div>
              )}
              {agencyData.status === 'approved' && (
                <div className="flex items-center gap-2 text-black bg-white px-4 py-2 rounded-xl w-fit">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Агентство: {agencyData.name}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 mb-8"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-xl'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>
        
        {/* Profile Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl">
                    <User className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Личные данные</h3>
                    <p className="text-neutral-400">Обновите информацию вашего профиля</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 flex items-center gap-2 font-medium">
                      <User className="h-4 w-4" />
                      Имя
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all placeholder:text-neutral-600"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 flex items-center gap-2 font-medium">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all placeholder:text-neutral-600"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl">
                    <Shield className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Безопасность</h3>
                    <p className="text-neutral-400">Измените пароль вашей учетной записи</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 flex items-center gap-2 font-medium">
                      <Lock className="h-4 w-4" />
                      Текущий пароль
                    </label>
                    <input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-neutral-400 block mb-3 flex items-center gap-2 font-medium">
                        <Key className="h-4 w-4" />
                        Новый пароль
                      </label>
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-400 block mb-3 flex items-center gap-2 font-medium">
                        <Check className="h-4 w-4" />
                        Подтвердите пароль
                      </label>
                      <input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProfileSave}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl"
              >
                <Save className="h-5 w-5" />
                <span>Сохранить изменения</span>
              </motion.button>
            </motion.div>
          )}
          
          {/* Agency Tab */}
          {activeTab === 'agency' && (
            <motion.div
              key="agency"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {agencyData.status === 'none' && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Зарегистрируйте агентство</h4>
                    <p className="text-neutral-400 text-sm">
                      Получите доступ к расширенным возможностям платформы и специальным тарифам для бизнеса.
                    </p>
                  </div>
                </div>
              )}
              
              {agencyData.status === 'pending' && (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-br from-white/15 to-white/5 border border-white/30 rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl">
                      <Clock className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h4 className="text-white text-xl font-bold mb-2">Заявка на рассмотрении</h4>
                      <p className="text-neutral-300">
                        Ваша заявка на регистрацию агентства <span className="font-semibold text-white">"{agencyData.name}"</span> находится на рассмотрении. 
                        Скоро с вами свяжутся наши специалисты.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {agencyData.status === 'approved' && (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-white border-2 border-white rounded-3xl p-8 shadow-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-black rounded-2xl">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-black text-xl font-bold mb-2">Агентство подтверждено</h4>
                      <p className="text-neutral-700">
                        Поздравляем! Ваше агентство <span className="font-semibold">"{agencyData.name}"</span> успешно зарегистрировано.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl">
                    <Building2 className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Информация об агентстве</h3>
                    <p className="text-neutral-400">Заполните данные вашей организации</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 font-medium">
                      Название компании/агентства *
                    </label>
                    <input
                      type="text"
                      value={agencyData.name}
                      onChange={(e) => handleAgencyChange('name', e.target.value)}
                      disabled={agencyData.status !== 'none'}
                      placeholder="ООО «Название»"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 font-medium">
                      Адрес *
                    </label>
                    <input
                      type="text"
                      value={agencyData.address}
                      onChange={(e) => handleAgencyChange('address', e.target.value)}
                      disabled={agencyData.status !== 'none'}
                      placeholder="ул. Примерная, д. 1"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-neutral-400 block mb-3 font-medium">
                        Город *
                      </label>
                      <input
                        type="text"
                        value={agencyData.city}
                        onChange={(e) => handleAgencyChange('city', e.target.value)}
                        disabled={agencyData.status !== 'none'}
                        placeholder="Москва"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-neutral-400 block mb-3 font-medium">
                        Страна *
                      </label>
                      <input
                        type="text"
                        value={agencyData.country}
                        onChange={(e) => handleAgencyChange('country', e.target.value)}
                        disabled={agencyData.status !== 'none'}
                        placeholder="Россия"
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-2xl">
                    <MessageCircle className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Контакты для связи</h3>
                    <p className="text-neutral-400">Укажите хотя бы один способ связи *</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 font-medium">
                      Telegram
                    </label>
                    <input
                      type="text"
                      value={agencyData.telegram}
                      onChange={(e) => handleAgencyChange('telegram', e.target.value)}
                      disabled={agencyData.status !== 'none'}
                      placeholder="@username"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 font-medium">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={agencyData.whatsapp}
                      onChange={(e) => handleAgencyChange('whatsapp', e.target.value)}
                      disabled={agencyData.status !== 'none'}
                      placeholder="+7 (900) 123-45-67"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 block mb-3 font-medium">
                      ВКонтакте
                    </label>
                    <input
                      type="text"
                      value={agencyData.vk}
                      onChange={(e) => handleAgencyChange('vk', e.target.value)}
                      disabled={agencyData.status !== 'none'}
                      placeholder="vk.com/username"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-neutral-600"
                    />
                  </div>
                </div>
              </div>
              
              {agencyData.status === 'none' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAgencySubmit}
                  disabled={!isAgencyFormValid}
                  className="w-full bg-white hover:bg-neutral-200 disabled:bg-white/20 disabled:cursor-not-allowed text-black disabled:text-neutral-500 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl"
                >
                  <Building2 className="h-5 w-5" />
                  <span>Отправить заявку на регистрацию</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}