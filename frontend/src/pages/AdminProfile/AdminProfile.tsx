/**
 * STEP 6: Admin Profile Page
 * Allow admin to edit profile info and avatar
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ICON_MAP, ROLE_DEFINITIONS, ProfileEditFormData, ProfileEditState } from '../types/dashboard.types';
import './AdminProfile.css';

export const AdminProfile: React.FC = () => {
  const { currentUser, updateUserProfile, isLoading: isContextLoading } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ProfileEditFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: ''
  });

  // UI state
  const [editState, setEditState] = useState<ProfileEditState>({
    isEditing: false,
    isSaving: false,
    saveSuccess: false,
    error: null,
    uploadingAvatar: false,
    previewAvatar: undefined
  });

  /**
   * Initialize form data from current user
   */
  useEffect(() => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || ''
      });
      setEditState(prev => ({
        ...prev,
        previewAvatar: currentUser.avatar_url
      }));
    }
  }, [currentUser]);

  /**
   * Handle input change
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setEditState(prev => ({
        ...prev,
        error: 'Please select an image file'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditState(prev => ({
        ...prev,
        error: 'Image must be smaller than 5MB'
      }));
      return;
    }

    try {
      setEditState(prev => ({
        ...prev,
        uploadingAvatar: true,
        error: null
      }));

      // Create FormData for multipart upload
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditState(prev => ({
          ...prev,
          previewAvatar: event.target?.result as string,
          uploadingAvatar: false
        }));
      };
      reader.readAsDataURL(file);

      // Update form data with avatar URL
      setFormData(prev => ({
        ...prev,
        avatar_url: data.url
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setEditState(prev => ({
        ...prev,
        error: message,
        uploadingAvatar: false
      }));
    }
  };

  /**
   * Handle save profile
   */
  const handleSaveProfile = async () => {
    try {
      setEditState(prev => ({
        ...prev,
        isSaving: true,
        error: null
      }));

      await updateUserProfile(formData);

      setEditState(prev => ({
        ...prev,
        isEditing: false,
        isSaving: false,
        saveSuccess: true
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setEditState(prev => ({
          ...prev,
          saveSuccess: false
        }));
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setEditState(prev => ({
        ...prev,
        error: message,
        isSaving: false
      }));
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || ''
      });
      setEditState(prev => ({
        ...prev,
        isEditing: false,
        error: null,
        previewAvatar: currentUser.avatar_url
      }));
    }
  };

  /**
   * Get role details
   */
  const roleDetails = currentUser ? ROLE_DEFINITIONS[currentUser.role_level] : null;

  /**
   * Get initials
   */
  const getInitials = (): string => {
    if (!currentUser) return '??';
    return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
  };

  if (isContextLoading || !currentUser) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Page Header */}
      <div className="profile-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles et vos préférences</p>
      </div>

      {/* Success Message */}
      {editState.saveSuccess && (
        <div className="profile-message success-message">
          <span className="message-icon">{ICON_MAP['check']}</span>
          <span>Profil mis à jour avec succès!</span>
        </div>
      )}

      {/* Error Message */}
      {editState.error && (
        <div className="profile-message error-message">
          <span className="message-icon">⚠️</span>
          <span>{editState.error}</span>
        </div>
      )}

      {/* Main Profile Content */}
      <div className="profile-content">
        {/* Left Column: Avatar Section */}
        <div className="profile-left">
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar-frame">
                {editState.previewAvatar ? (
                  <img src={editState.previewAvatar} alt={currentUser.first_name} />
                ) : (
                  <span className="avatar-initials">{getInitials()}</span>
                )}
              </div>

              {editState.isEditing && (
                <button
                  className="avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={editState.uploadingAvatar}
                  title="Upload avatar"
                >
                  {editState.uploadingAvatar ? (
                    <span>⏳</span>
                  ) : (
                    <span>{ICON_MAP['camera']}</span>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                aria-label="Upload profile picture"
              />
            </div>

            {editState.isEditing && (
              <p className="avatar-help">Cliquez sur l'icône caméra pour changer votre photo</p>
            )}
          </div>

          {/* Role Card */}
          <div className="role-card">
            <div className="role-icon" style={{ color: roleDetails?.color }}>
              👔
            </div>
            <div className="role-text">
              <h3>{currentUser.role_name}</h3>
              <p>{roleDetails?.description}</p>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="info-card">
            <h3>Informations du Compte</h3>
            <div className="info-item">
              <span className="info-label">Statut:</span>
              <span className={`info-value status-${currentUser.status}`}>
                {currentUser.status === 'active' && '🟢 Actif'}
                {currentUser.status === 'pending' && '🟡 En attente'}
                {currentUser.status === 'blocked' && '🔴 Bloqué'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Créé le:</span>
              <span className="info-value">
                {new Date(currentUser.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {currentUser.last_login && (
              <div className="info-item">
                <span className="info-label">Dernière connexion:</span>
                <span className="info-value">
                  {new Date(currentUser.last_login).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Form Section */}
        <div className="profile-right">
          <form className="profile-form">
            {/* Name Section */}
            <div className="form-section">
              <h3>Nom & Prénom</h3>
              <div className="form-group form-group-inline">
                <div className="form-field">
                  <label htmlFor="first_name">Prénom</label>
                  <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!editState.isEditing}
                    className="form-input"
                    placeholder="Jean"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="last_name">Nom</label>
                  <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!editState.isEditing}
                    className="form-input"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="form-section">
              <h3>Informations de Contact</h3>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editState.isEditing}
                  className="form-input"
                  placeholder="jean@company.com"
                />
                <small>Votre adresse email de connexion</small>
              </div>

              <div className="form-field">
                <label htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editState.isEditing}
                  className="form-input"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="form-section">
              <h3>À Propos</h3>
              <div className="form-field">
                <label htmlFor="bio">Biographie</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!editState.isEditing}
                  className="form-textarea"
                  placeholder="Dites-nous en plus sur vous..."
                  rows={5}
                />
                <small>{formData.bio.length}/500 caractères</small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              {!editState.isEditing ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setEditState(prev => ({ ...prev, isEditing: true }))}
                >
                  {ICON_MAP['edit']} Modifier mon profil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSaveProfile}
                    disabled={editState.isSaving}
                  >
                    {editState.isSaving ? (
                      <>
                        <span>{ICON_MAP['loading']}</span> Enregistrement...
                      </>
                    ) : (
                      <>
                        <span>{ICON_MAP['check']}</span> Enregistrer
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={editState.isSaving}
                  >
                    <span>{ICON_MAP['close']}</span> Annuler
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
