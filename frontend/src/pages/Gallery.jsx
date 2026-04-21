const IMAGES = [
  "https://images.pexels.com/photos/19146676/pexels-photo-19146676.jpeg",
  "https://images.pexels.com/photos/7267573/pexels-photo-7267573.jpeg",
  "https://images.pexels.com/photos/19146676/pexels-photo-19146676.jpeg",
  "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/3ad57717315ce5ecb14a46b370093b6d5a2a2f854676df31d08a953a1074b26a.png",
  "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/45463ca105cb35464b727245d958acd21526b02873b6de8f5ac2ef259fea4bf8.png",
  "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/65609957ee1c8d2b312741cc07f5277bae779005afc80d6093ef3d2be5a23de6.png",
];

export default function Gallery() {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto" data-testid="gallery-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316] mb-2">Momen SMK</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Galeri</h1>
      <p className="mt-3 text-[#94A3B8] text-sm">Koleksi gambar rasmi kejohanan. Akan dikemas kini sepanjang acara.</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {IMAGES.map((src, i) => (
          <div key={i} className="aspect-square bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid={`gallery-img-${i}`}>
            <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}
