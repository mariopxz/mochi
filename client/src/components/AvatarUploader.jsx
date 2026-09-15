import { useState } from "react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export default function AvatarUploader({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen no puede superar los 2 MB");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );

    setUploading(true);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "No se pudo subir la imagen");
      }

      onUpload(data.secure_url);
    } catch (err) {
      setError(err.message || "No se pudo subir la imagen");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

    return (
      <div>
        <label
          htmlFor="avatar-file"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Foto de perfil
        </label>

        <input
          id="avatar-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-2 text-xs text-slate-400">
          JPG, PNG o WebP. Máximo 2 MB.
        </p>

        {uploading && (
          <p className="mt-2 text-sm text-indigo-600">Subiendo imagen...</p>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  };
