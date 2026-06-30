// src/components/admin/CloudinaryWidget.tsx
"use client";

import { CldUploadWidget } from 'next-cloudinary';

interface Props {
  onSuccess: (url: string) => void;
}

export default function CloudinaryWidget({ onSuccess }: Props) {
  return (
    <CldUploadWidget 
      uploadPreset="beatmemo_preset" // El que creaste en Cloudinary
      onSuccess={(result: any) => {
        // Obtenemos la URL base. Cloudinary se encarga del resto en el front
        onSuccess(result.info.secure_url);
      }}
      options={{
        sources: ['local'],
        multiple: false,
        cropping: false, // La IA de recorte la manejaremos con parámetros de URL
      }}
    >
      {({ open }) => (
        <button 
          type="button"
          onClick={() => open()}
          className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg text-sm text-white hover:bg-neutral-700 transition"
        >
          Subir imagen destacada
        </button>
      )}
    </CldUploadWidget>
  );
}