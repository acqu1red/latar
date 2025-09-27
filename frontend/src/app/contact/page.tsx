"use client"

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactPage = () => {
  const t = useTranslations('ContactPage');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
    // Здесь будет логика отправки формы на сервер
    alert(t('formSubmissionSuccess'));
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">{t('title')}</h1>
      <p className="text-lg text-center text-muted-foreground mb-12">{t('subtitle')}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Контактная информация */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">{t('contactInfoTitle')}</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <p><strong>{t('emailLabel')}:</strong> <a href="mailto:info@flatmap.ai" className="text-primary hover:underline">info@flatmap.ai</a></p>
            <p><strong>{t('phoneLabel')}:</strong> +1 (555) 123-4567</p>
            <p><strong>{t('addressLabel')}:</strong> {t('addressValue')}</p>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">{t('formTitle')}</h2>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  {t('nameLabel')}
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('namePlaceholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t('emailLabel')}
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  {t('messageLabel')}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('messagePlaceholder')}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                {t('submitButton')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
