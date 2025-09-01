import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, ChevronDown } from 'lucide-react';

function App() {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('02.09.2025, 00:04');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220%200%2060%2060%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative max-w-md w-full">
        {/* Main Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-3">
              Текущая итерация
            </h1>
            <div className="text-4xl font-bold text-white/90 tracking-wide">
              Ca
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-white/70 font-medium">Статус:</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-green-400 font-semibold">Открыта</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 font-medium">Дедлайн:</span>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="font-medium">2 сентября 2025 г. в 18:13</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/70 font-medium">Кандидатов:</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-white font-bold text-lg">4</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg mb-8 flex items-center justify-center gap-3">
            <CheckCircle className="w-5 h-5" />
            Закрыть и объявить результаты
          </button>

          {/* Deadline Modifier Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white text-center mb-6">
              Изменить дедлайн
            </h2>
            
            {/* Date Picker */}
            <div className="relative">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-4 text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDatePickerOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <input
                      type="date"
                      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      defaultValue="2025-09-02"
                    />
                    <input
                      type="time"
                      className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      defaultValue="00:04"
                    />
                  </div>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                  >
                    Применить
                  </button>
                </div>
              )}
            </div>

            {/* Set Button */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg flex items-center justify-center gap-3">
              <Clock className="w-5 h-5" />
              Установить
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}

export default App;