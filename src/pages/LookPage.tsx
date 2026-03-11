import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { LOOK_IMAGES } from "@/data/looks";

const BG = "#F5F5F5";

export default function LookPage() {
  const { id } = useParams<{ id: string }>();
  const index = id ? parseInt(id, 10) - 1 : -1;
  const valid = index >= 0 && index < LOOK_IMAGES.length;
  const src = valid ? LOOK_IMAGES[index] : null;

  return (
    <div className="min-h-screen w-full" style={{ background: BG }}>
      <Link
        to="/lookbook"
        className="fixed top-6 left-6 z-10 text-xs tracking-[0.2em] uppercase hover:opacity-70"
        style={{ color: "#1a1a1a" }}
      >
        ← Back to Lookbook
      </Link>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        {valid && src ? (
          <>
            <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Look {String(index + 1).padStart(2, "0")}
            </div>
            <div className="relative w-full max-w-2xl aspect-[4/5] rounded-sm overflow-hidden bg-muted">
              <img
                src={src}
                alt={`Look ${id}`}
                className="w-full h-full object-cover object-bottom"
              />
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Look not found.</p>
        )}
      </div>
    </div>
  );
}
