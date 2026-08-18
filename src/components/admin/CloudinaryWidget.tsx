// src/components/admin/CloudinaryWidget.tsx
"use client";

import { CldUploadWidget } from 'next-cloudinary';

interface Props {
  onSuccess: (url: string) => void;
  label?: string;
  folder?: string;

}

export default function CloudinaryWidget({ onSuccess, label, folder }: Props) {
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
        cropping: false,
        maxFileSize: 10485760,  
        ...(folder ? { folder } : {}),

      }}
    >
      {({ open }) => (
        <button 
          type="button"
          onClick={() => open()}
          className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg text-sm text-white hover:bg-neutral-700 transition"
        >
          {label || "Subir imagen"}
        </button>
      )}
    </CldUploadWidget>
  );
}