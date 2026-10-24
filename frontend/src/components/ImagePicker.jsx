import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { compressImages } from "@/utils/compressImage";
import { FILE_URL } from "@/utils/api";

// existing: urls already on server; files: new compressed Files
export default function ImagePicker({ multiple = false, max = 5, existing = [], onExisting, files, onFiles }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const previews = files.map((f) => URL.createObjectURL(f));
  const count = existing.length + files.length;

  const pick = async (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    if (!picked.length) return;
    setBusy(true);
    try {
      const room = multiple ? max - count : 1;
      const out = await compressImages(picked.slice(0, Math.max(room, 0)));
      onFiles(multiple ? [...files, ...out] : out);
    } catch { toast.error("Gambar tidak dapat diproses"); }
    setBusy(false);
  };

  const Thumb = ({ src, onRemove }) => (
    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button type="button" onClick={onRemove} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-slate-700"><X size={12} /></button>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {existing.map((u) => <Thumb key={u} src={FILE_URL + u} onRemove={() => onExisting(existing.filter((i) => i !== u))} />)}
      {previews.map((p, i) => <Thumb key={p} src={p} onRemove={() => onFiles(files.filter((_, j) => j !== i))} />)}
      {(multiple ? count < max : !files.length) && (
        <button type="button" onClick={() => ref.current.click()} disabled={busy}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-brand-600 hover:text-brand-600">
          <ImagePlus size={18} />{busy ? "..." : "Pilih"}
        </button>
      )}
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp" multiple={multiple} hidden onChange={pick} />
    </div>
  );
}
