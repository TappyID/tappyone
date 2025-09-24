'use client'

import React from 'react'

interface ProfileAvatarProps {
  contactName: string
  contactNumber: string
  profilePictureUrl?: string
  theme: string
}

export default function ProfileAvatar({
  contactName,
  contactNumber,
  profilePictureUrl,
  theme
}: ProfileAvatarProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      {profilePictureUrl ? (
        <img 
          src={profilePictureUrl} 
          alt={contactName}
          className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/20 mb-3"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl mb-3">
          {contactName.charAt(0).toUpperCase()}
        </div>
      )}
      
      <h4 className={`text-xl font-semibold ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {contactName}
      </h4>
      
      <p className={`text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {contactNumber}
      </p>
    </div>
  )
}
