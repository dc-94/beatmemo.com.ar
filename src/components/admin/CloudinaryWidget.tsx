// src/components/admin/CloudinaryWidget.tsx
"use client";

import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  onSuccess: (url: string) => void;
  label?: string;
  folder?: string;
  variant?: "box" | "primary";  
}

export default function CloudinaryWidget({ onSuccess, label, folder = "beatmemo/pub", variant = "box" }: Props) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary-sign"
      options={{ sources: ["local"], multiple: false, cropping: false, maxFileSize: 10485760, folder }}
      onSuccess={(result: any) => onSuccess(result.info.secure_url)}
      onError={() => toast.error("Falló la subida. Probá de nuevo.")}
    >
      {({ open }) =>
        variant === "primary" ? (
          <Button type="button" size="sm" onClick={() => open()}>
            <Plus size={16} /> {label || "Subir"}
          </Button>
        ) : (
          <button type="button" onClick={() => open()}
            className="bg-neutral-800 border border-neutral-700 p-4 rounded-lg text-sm text-white hover:bg-neutral-700 transition">
            {label || "Subir imagen"}
          </button>
        )
      }
    </CldUploadWidget>
  );
}