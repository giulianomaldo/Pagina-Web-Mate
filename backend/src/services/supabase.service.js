'use strict';

const { createClient } = require('@supabase/supabase-js');
const { supabase } = require('../config/env');
const ApiError = require('../utils/ApiError');

// Ensure supabase vars are available before initializing
if (!supabase.url || !supabase.key) {
  console.warn('⚠️ Supabase credentials are not fully configured in environment variables.');
}

const supabaseClient = createClient(
  supabase.url || 'https://placeholder.supabase.co',
  supabase.key || 'placeholder_key'
);

/**
 * Generates a unique filename for Supabase Storage
 * @param {string} originalName (optional)
 * @returns {string}
 */
function generateFilename(originalName = '') {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${randomStr}.${extension}`;
}

/**
 * Uploads a buffer to Supabase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Destination folder (e.g., 'encontrarte/productos')
 * @returns {Promise<{url: string, public_id: string}>}
 */
async function uploadBuffer(buffer, folder = 'uploads') {
  if (!buffer) {
    throw ApiError.badRequest('No se proporcionó archivo para subir.');
  }

  const filename = generateFilename();
  const path = `${folder}/${filename}`;

  const { data, error } = await supabaseClient.storage
    .from(supabase.bucket)
    .upload(path, buffer, {
      contentType: 'image/jpeg', // Multer doesn't pass mimetype down the service layer easily in this setup, defaulting to jpeg or inferring from buffer is better but jpeg works for most images
      upsert: false
    });

  if (error) {
    throw ApiError.internal('Error al subir imagen a Supabase Storage: ' + error.message);
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from(supabase.bucket)
    .getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    public_id: path // We use the full path as the public_id for easy deletion later
  };
}

/**
 * Uploads multiple buffers to Supabase Storage
 * @param {Buffer[]} buffers
 * @param {string} folder
 * @returns {Promise<Array<{url: string, public_id: string}>>}
 */
async function uploadMultiple(buffers, folder = 'uploads') {
  if (!buffers || !buffers.length) return [];
  const uploadPromises = buffers.map((buf) => uploadBuffer(buf, folder));
  return Promise.all(uploadPromises);
}

/**
 * Deletes a file from Supabase Storage
 * @param {string} public_id - The path of the file
 */
async function deleteImage(public_id) {
  if (!public_id) return;
  const { error } = await supabaseClient.storage
    .from(supabase.bucket)
    .remove([public_id]);
  
  if (error) {
    console.error(`Error deleting image ${public_id}:`, error);
  }
}

/**
 * Deletes multiple files from Supabase Storage
 * @param {string[]} public_ids
 */
async function deleteMultiple(public_ids) {
  if (!public_ids || !public_ids.length) return;
  const { error } = await supabaseClient.storage
    .from(supabase.bucket)
    .remove(public_ids);
    
  if (error) {
    console.error(`Error deleting multiple images:`, error);
  }
}

module.exports = {
  uploadBuffer,
  uploadMultiple,
  deleteImage,
  deleteMultiple,
};
