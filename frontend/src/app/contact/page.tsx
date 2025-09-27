"use client"

import React, { useState } from 'react';

export const dynamic = 'force-dynamic';
// import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContactPage = () => {
  // const t = useTranslations('ContactPage');
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
    alert('Сообщение успешно отправлено!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold text-center mb-8">Контакты</h1>
      <p className="text-lg text-center text-gray-600 mb-12">Свяжитесь с нами для получения дополнительной информации</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Контактная информация */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">Контактная информация</h2>
          </div>
          <div className="space-y-4 text-gray-600">
            <p><strong>Email:</strong> <a href="mailto:info@flatmap.ai" className="text-primary hover:underline">info@flatmap.ai</a></p>
            <p><strong>Телефон:</strong> +1 (555) 123-4567</p>
            <p><strong>Адрес:</strong> Москва, Россия</p>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="p-6 border rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">Форма обратной связи</h2>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Имя
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Введите ваше имя"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Введите ваш email"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Сообщение
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Введите ваше сообщение"
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Отправить
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
