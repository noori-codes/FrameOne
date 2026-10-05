"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area } from "react-easy-crop";
import { X } from "lucide-react";

type AvatarCropModalProps = {
  imageSrc: string;
  open: boolean;
  onCancel: () => void;
  onCropped: (file: File) => void;
};

const OUTPUT_SIZE = 512;

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Draw the cropped region to a canvas and return a JPEG File. */
async function getCroppedFile(
  imageSrc: string,
  crop: Area,
  fileName = "avatar.jpg",
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to export image"))),
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], fileName, { type: "image/jpeg" });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error("Failed to load image")),
    );
    img.src = src;
  });
}

type CropBodyProps = {
  imageSrc: string;
  onCancel: () => void;
  onCropped: (file: File) => void;
};

/** Fresh crop/zoom state per image (remount via key). */
function CropBody({ imageSrc, onCancel, onCropped }: CropBodyProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedArea || saving) return;
    setSaving(true);
    try {
      const file = await getCroppedFile(imageSrc, croppedArea);
      onCropped(file);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-cream/10 bg-stage shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] sm:max-h-[min(90dvh,40rem)] sm:rounded-2xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-cream/10 px-4 py-3.5 sm:px-5 sm:py-4">
        <h2
          id="avatar-crop-title"
          className="text-base font-semibold tracking-tight text-cream sm:text-lg"
        >
          Edit photo
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="rounded-full border border-cream/20 p-2 text-cream/60 transition-colors hover:border-cream/40 hover:text-cream sm:p-1.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mx-auto aspect-square w-[min(100%,52dvh)] shrink-0 bg-background sm:w-full sm:max-w-none">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="flex shrink-0 flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-5">
        <label className="flex flex-col gap-2 text-sm text-cream/60">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-8 w-full accent-amber sm:h-auto"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="min-h-11 rounded-full border border-cream/20 px-4 py-2.5 text-sm text-cream/70 transition-colors hover:border-cream/40 hover:text-cream disabled:opacity-60 sm:min-h-0 sm:py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !croppedArea}
            onClick={handleSave}
            className="min-h-11 flex-1 rounded-full bg-amber px-4 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream disabled:opacity-60 sm:min-h-0 sm:flex-none sm:py-2"
          >
            {saving ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Modal: pan/zoom a square crop, then export a JPEG for upload. */
export function AvatarCropModal({
  imageSrc,
  open,
  onCancel,
  onCropped,
}: AvatarCropModalProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open || !isClient || !imageSrc) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-crop-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <CropBody
        key={imageSrc}
        imageSrc={imageSrc}
        onCancel={onCancel}
        onCropped={onCropped}
      />
    </div>,
    document.body,
  );
}
