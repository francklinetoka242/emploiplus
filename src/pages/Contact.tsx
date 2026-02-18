import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useState } from 'react';
import { toast } from 'sonner';

export default function Contact() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      return toast.error('Veuillez remplir tous les champs');
    }
    try {
      setSending(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, category }),
      });
      if (!res.ok) throw new Error('Erreur envoi');
      toast.success('Message envoyé, nous vous contacterons bientôt');
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setCategory('general');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error('Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3 text-gray-900">Nous contacter</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vous avez des questions ? Notre équipe est disponible pour vous aider. N'hésitez pas à nous contacter via le formulaire ou les informations ci-dessous.
            </p>
          </div>

          {/* Contact Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Email Card */}
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Email</h3>
              <p className="text-gray-600 text-sm mb-4">Contactez-nous par email pour une réponse détaillée</p>
              <a href="mailto:contact@emploiplus-group.com" className="text-blue-600 font-medium hover:text-blue-700 text-sm">
                contact@emploiplus-group.com
              </a>
            </Card>

            {/* Phone Card */}
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">WhatsApp</h3>
              <p className="text-gray-600 text-sm mb-4">Discutez avec nous en direct sur WhatsApp</p>
              <a href="https://wa.me/242067311033" target="_blank" rel="noreferrer" className="text-green-600 font-medium hover:text-green-700 text-sm">
                +242 0673 11033
              </a>
            </Card>

            {/* Support Card */}
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-100 mb-4">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Support Technique</h3>
              <p className="text-gray-600 text-sm mb-4">Besoin d'aide technique ?</p>
              <a href="mailto:support@emploiplus-group.com" className="text-red-600 font-medium hover:text-red-700 text-sm">
                support@emploiplus-group.com
              </a>
            </Card>

            {/* Location Card */}
            <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow bg-white lg:col-start-1">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Localisation</h3>
              <p className="text-gray-600 text-sm mb-4">Nous sommes basés à Brazzaville</p>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Brazzaville, République du Congo</p>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Clock className="h-4 w-4" />
                  <span>Lun-Ven, 9h-17h</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Contact Section */}
          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {/* Contact Form */}
            <Card className="p-8 border-0 shadow-lg bg-white">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Envoyer un message</h2>
              </div>

              {submitted ? (
                <div className="py-12 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Message envoyé avec succès !</h3>
                  <p className="text-gray-600">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                    >
                      <option value="general">Demande générale</option>
                      <option value="support">Support technique</option>
                      <option value="partnership">Partenariat</option>
                      <option value="recruitment">Recrutement</option>
                      <option value="feedback">Retour / Suggestion</option>
                    </select>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Objet *</label>
                    <input
                      type="text"
                      placeholder="Objet de votre message"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      placeholder="Détaillez votre message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Les champs marqués avec * sont obligatoires
                  </p>
                </form>
              )}
            </Card>

            {/* FAQ Section */}
            <Card className="p-8 border-0 shadow-lg bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quel est le meilleur moment pour nous contacter ?</h3>
                  <p className="text-gray-600 text-sm">
                    Nous sommes disponibles du lundi au vendredi, de 9h à 17h. Les messages en dehors de ces horaires seront traités le jour ouvrable suivant.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Combien de temps pour une réponse ?</h3>
                  <p className="text-gray-600 text-sm">
                    Nous nous efforçons de répondre à tous les messages dans les 24 heures. Les demandes urgentes peuvent être adressées via WhatsApp.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Puis-je avoir une assistance immédiate ?</h3>
                  <p className="text-gray-600 text-sm">
                    Oui, contactez-nous via WhatsApp pour une assistance en temps réel pendant nos heures de fonctionnement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comment devenir partenaire ?</h3>
                  <p className="text-gray-600 text-sm">
                    Sélectionnez "Partenariat" dans le formulaire et détaillez votre proposition. Notre équipe vous contactera pour discuter de opportunités.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mes données sont-elles sécurisées ?</h3>
                  <p className="text-gray-600 text-sm">
                    Oui, tous vos messages sont traités de manière confidentielle et conforme à nos politiques de protection des données.
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Ressources utiles</h3>
                <div className="space-y-3">
                  <a href="/privacy" className="block text-blue-600 hover:text-blue-700 text-sm font-medium">
                    → Politique de confidentialité
                  </a>
                  <a href="/legal" className="block text-blue-600 hover:text-blue-700 text-sm font-medium">
                    → Mentions légales
                  </a>
                  <a href="/guide-utilisateur" className="block text-blue-600 hover:text-blue-700 text-sm font-medium">
                    → Guide utilisateur
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
