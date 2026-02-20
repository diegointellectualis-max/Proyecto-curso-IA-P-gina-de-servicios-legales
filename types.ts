
import React from 'react';

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  id: string;
}

export interface NewsCardProps {
  tag: string;
  title: string;
  excerpt: string;
}

export interface ChatMessage {
  role: 'user' | 'amelia';
  text: string;
}
