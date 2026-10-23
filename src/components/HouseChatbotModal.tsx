/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Send, Volume2, Shield, MessageSquare, History, Sparkles } from 'lucide-react';
import { Character } from '../game/simulation';
import { sound } from '../game/soundSynth';

interface HouseChatbotModalProps {
  onClose: () => void;
  characters: Character[];
  wallLogs: string[];
  isDarkMode: boolean;
  onWhisperToCharacter: (charId: string, whisperText: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'house';
  text: string;
  timestamp: string;
}

export const HouseChatbotModal: React.FC<HouseChatbotModalProps> = ({
  onClose,
  characters,
  wallLogs,
  isDarkMode,
  onWhisperToCharacter,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'logs' | 'whisper'>('chat');
  const [inputMsg, setInputMsg] = useState('');
  const [selectedWhisperChar, setSelectedWhisperChar] = useState(characters[0]?.id || '');
  const [whisperText, setWhisperText] = useState('');
  const [whisperStatus, setWhisperStatus] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'house',
      text: isDarkMode
        ? "I am The House. If my walls could bleed, they would recount horrors untold. Within my 64x64 bounds, no secret is safe from me. What do you wish to pry into?"
        : "Welcome back! I am The House. I've been watching over the household while you were away. Ask me what happened in the kitchen, who made a mess, or check my recent wall records!",
      timestamp: '08:00 AM',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Generate response from The House
    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('who') || lower.includes('what') || lower.includes('happened') || lower.includes('miss')) {
        const recentEvents = wallLogs.slice(-3).join('; ');
        reply = recentEvents
          ? `Here is what my floorboards recorded recently: ${recentEvents}`
          : `All has been unusually tranquil within my lot. The family has been attending to their basic needs.`;
      } else if (lower.includes('secret') || lower.includes('basement') || lower.includes('dark')) {
        reply = isDarkMode
          ? "The air in the basement carries the metallic scent of rust and isolation. One of your occupants checked the heavy lock while the others slept."
          : "Secrets? Oh, someone sneakily had a midnight slice of cake from the fridge, but nothing sinister!";
      } else if (lower.includes('elena') || lower.includes('marcus') || lower.includes('arthur')) {
        const target = characters.find((c) => lower.includes(c.name.toLowerCase()));
        if (target) {
          reply = `${target.name} is currently in the ${target.room} ${target.currentAction.toLowerCase()}. Their sanity is at ${Math.round(
            target.motives.sanity
          )}%.`;
        } else {
          reply = "I see all the occupants walking through my doors, living out their days.";
        }
      } else {
        reply = isDarkMode
          ? `The walls creak in acknowledgment of your query. Remember, once they step off my sidewalk, my eyes cannot follow.`
          : `I note your words in the domestic ledger. Life goes on at 3x the standard pace within my rooms!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_house_${Date.now()}`,
          sender: 'house',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      sound.playChime(true);
    }, 450);
  };

  const handleSendWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperText.trim() || !selectedWhisperChar) return;

    onWhisperToCharacter(selectedWhisperChar, whisperText.trim());
    setWhisperStatus(`Whisper successfully planted in ${characters.find((c) => c.id === selectedWhisperChar)?.name}'s inner thoughts!`);
    setWhisperText('');
    sound.playMurmur(1.2, isDarkMode);
    setTimeout(() => setWhisperStatus(null), 3000);
  };

  const handleSpeakText = (text: string) => {
    sound.speakEnglish(text, isDarkMode ? 0.8 : 1.05, 1.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col ${
          isDarkMode
            ? 'bg-gray-950 text-gray-100 border-purple-900/80'
            : 'bg-white text-gray-900 border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">The House — Omniscient Narrator</h2>
              <p className="text-xs text-gray-500">
                "If the walls could talk" • Records all domestic life while you are away
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mt-3 text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat with The House
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <History className="w-4 h-4" />
            Wall Records ({wallLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('whisper')}
            className={`flex-1 py-2 font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'whisper'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Direct Whisper
          </button>
        </div>

        {/* Tab Content: Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 pt-3">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : isDarkMode
                        ? 'bg-purple-950/50 border border-purple-800 text-purple-200 rounded-bl-none'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-mono">
                      <span>{m.sender === 'user' ? 'You' : 'The House'}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p>{m.text}</p>
                    {m.sender === 'house' && (
                      <button
                        onClick={() => handleSpeakText(m.text)}
                        className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        Hear Voice (TTS)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask The House what happened, or query a character..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Ask
              </button>
            </form>
          </div>
        )}

        {/* Tab Content: Wall Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col min-h-0 pt-3">
            <p className="text-xs text-gray-500 mb-2">
              Chronological black-box history of all actions, self-talk, and offline occurrences on the 64x64 lot:
            </p>
            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs pr-2">
              {wallLogs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">No domestic logs recorded yet.</div>
              ) : (
                wallLogs.slice().reverse().map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] leading-snug"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Direct Whisper */}
        {activeTab === 'whisper' && (
          <form onSubmit={handleSendWhisper} className="flex-1 flex flex-col justify-between pt-4 space-y-4">
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Act as a subconscious voice inside a character's mind. The thought will become an isolated observation in their private memory stream.
              </p>

              <div>
                <label className="block text-xs font-semibold mb-1">Target Character</label>
                <select
                  value={selectedWhisperChar}
                  onChange={(e) => setSelectedWhisperChar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.room} - {Math.round(c.motives.sanity)}% Sanity)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Injected Thought / Whisper</label>
                <textarea
                  required
                  rows={3}
                  value={whisperText}
                  onChange={(e) => setWhisperText(e.target.value)}
                  placeholder="e.g. You feel a sudden urge to paint an eerie masterpiece in the study..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {whisperStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                  {whisperStatus}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Implant Thought into Character's Mind
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
