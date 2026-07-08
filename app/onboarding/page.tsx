'use client';

import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AddressAutocomplete, { AddressData } from '@/components/AddressAutocomplete';

// ============================================================
// Supabase client (inline — move to env vars when you're ready)
// ============================================================
const supabase = createClient(
  'https://xcfkhdjiragblsiqetes.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjZmtoZGppcmFnYmxzaXFldGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2OTY0ODYsImV4cCI6MjA5NzI3MjQ4Nn0.EkmgRuYzrvF0A_pgT9vaOouMRKeQ2kasPZxpoIuCgeE'
);

// ============================================================
// Config
// ============================================================
const TOTAL_STEPS = 6;
const CATEGORIES = ['Κουρείο', 'Barbershop', 'Κομμωτήριο', 'Nail Salon'];
const DAY_LABELS = ['Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ'];

function slugify(str: string) {
  const map: Record<string, string> = {
    ά: 'a', έ: 'e', ή: 'i', ί: 'i', ό: 'o', ύ: 'y', ώ: 'o',
    α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th',
    ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p',
    ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
  };
  return (
    (str || '')
      .toLowerCase()
      .split('')
      .map((ch) => map[ch] || ch)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'to-katastima-mou'
  );
}

type Service = { name: string; price: number };
type Hour = { active: boolean; open: string; close: string };

// ============================================================
// Page
// ============================================================
export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finalLink, setFinalLink] = useState('');

  // step 1 — account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // step 2 — business
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  // step 3 — services
  const [services, setServices] = useState<Service[]>([
    { name: 'Ανδρικό Κούρεμα', price: 15 },
    { name: 'Κούρεμα + Γένια', price: 22 },
  ]);
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('');

  // step 4 — hours
  const [hours, setHours] = useState<Hour[]>([
    { active: true, open: '09:00', close: '19:00' },
    { active: true, open: '09:00', close: '19:00' },
    { active: true, open: '09:00', close: '19:00' },
    { active: true, open: '09:00', close: '21:00' },
    { active: true, open: '09:00', close: '21:00' },
    { active: true, open: '10:00', close: '16:00' },
    { active: false, open: '', close: '' },
  ]);

  // step 5 — photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleAddressChange = (addressData: AddressData) => {
    setStreet(addressData.street);
    setStreetNumber(addressData.streetNumber);
    setCity(addressData.city);
    setPostalCode(addressData.postalCode);
    setAddress(`${addressData.street} ${addressData.streetNumber}`.trim());
  };

  function back() {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  }

  async function next() {
    setError('');
    if (step === TOTAL_STEPS) {
      await handleFinish();
      return;
    }
    setStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
  }

  function canNext() {
    if (step === 1) return email.trim() && password.trim().length >= 6;
    if (step === 2) return shopName.trim() && phone.trim() && street.trim() && city.trim();
    if (step === 3) return services.length > 0;
    return true;
  }

  function addService() {
    const price = Number(newSvcPrice) || 0;
    if (!newSvcName.trim()) return;
    setServices([...services, { name: newSvcName.trim(), price }]);
    setNewSvcName('');
    setNewSvcPrice('');
  }
  function removeService(i: number) {
    setServices(services.filter((_, idx) => idx !== i));
  }

  function toggleHour(i: number) {
    setHours((prev) =>
      prev.map((h, idx) =>
        idx === i
          ? {
              ...h,
              active: !h.active,
              open: !h.active && !h.open ? '09:00' : h.open,
              close: !h.active && !h.close ? '19:00' : h.close,
            }
          : h
      )
    );
  }
  function updateHour(i: number, field: 'open' | 'close', value: string) {
    setHours((prev) => prev.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)));
  }

  function onLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }
  function onPhotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 10 - photoFiles.length);
    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  }
  function removePhoto(i: number) {
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function uploadToBucket(file: File, path: string) {
    const { error: upErr } = await supabase.storage.from('shop-media').upload(path, file, {
      upsert: true,
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from('shop-media').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleFinish() {
    setLoading(true);
    setError('');

    try {
      let userId = '';
      const { data: { user: existingUser } } = await supabase.auth.getUser();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        if (!authData.user?.id) {
          setError('Σφάλμα εγγραφής!');
          setLoading(false);
          return;
        }
        userId = authData.user.id;
      }

      const slug = slugify(shopName || `${fullName}-${city}`);
      const logoUrl = logoFile ? await uploadToBucket(logoFile, `logos/${slug}-${logoFile.name}`) : '';
      const coverUrl = photoFiles[0]
        ? await uploadToBucket(photoFiles[0], `covers/${slug}-${photoFiles[0].name}`)
        : '';

      const { data: shopData, error: shopError } = await supabase
        .from('barbershops')
        .insert({
          name: shopName,
          city,
          address,
          phone,
          email: email || existingUser?.email,
          bio,
          num_barbers: teamSize,
          category,
          logo_url: logoUrl,
          cover_url: coverUrl,
          instagram,
          facebook,
          description: '',
          rating: 5.0,
        })
        .select()
        .single();

      if (shopError) {
        setError('Σφάλμα δημιουργίας κουρείου: ' + shopError.message);
        setLoading(false);
        return;
      }

      await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        role: 'owner',
        barbershop_id: shopData.id,
      });

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome_owner',
          to: email,
          data: { ownerName: fullName, shopName, city },
        }),
      });

      setFinalLink(`barberbook.app/${slug}`);
      setStep(TOTAL_STEPS + 1);
    } catch (e: any) {
      setError('Κάτι πήγε στραβά: ' + (e?.message || 'Άγνωστο σφάλμα'));
    }

    setLoading(false);
  }
  const pct = step > TOTAL_STEPS ? 100 : Math.round(((step - 1) / TOTAL_STEPS) * 100);

  const inputCls =
    'w-full bg-[#101c33] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-[#eaeef6] focus:outline-none focus:border-[#3b7bff]';
  const timeInputCls =
    'bg-[#101c33] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#eaeef6] focus:outline-none focus:border-[#3b7bff]';
  const stepperBtnCls =
    'w-8 h-8 rounded-lg border border-white/10 bg-[#101c33] font-bold flex items-center justify-center';

  return (
    <div className="min-h-screen bg-[#070c16] text-[#eaeef6]">
      <div className="max-w-lg mx-auto px-5 py-8 pb-28">
        {/* brand */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b7bff] to-[#d4af37] flex items-center justify-center text-sm">
            ✂️
          </div>
          <span className="font-bold text-lg">BarberBook</span>
        </div>

        {/* progress */}
        <div className="mb-7">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#8a97ac] font-semibold">
              {step > TOTAL_STEPS ? 'Ολοκληρώθηκε!' : `Βήμα ${step} από ${TOTAL_STEPS}`}
            </span>
            <span className="text-[#3b7bff] font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#101c33] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3b7bff] to-[#d4af37] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ff5c72]/10 border border-[#ff5c72]/30 text-[#ff5c72] text-sm">
            {error}
          </div>
        )}

        {/* ---------------- STEP 1 — account ---------------- */}
        {step === 1 && (
          <div>
            <div className="w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-[#3b7bff]/15 to-[#d4af37]/15 border border-white/10 flex items-center justify-center text-2xl">
              👋
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Καλώς ήρθες στο BarberBook</h1>
            <p className="text-[#8a97ac] text-sm mb-6 leading-relaxed">
              Δημιούργησε λογαριασμό για να ξεκινήσεις να δέχεσαι ραντεβού online.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Κωδικός</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Τουλάχιστον 6 χαρακτήρες" className={inputCls} />
            </div>
          </div>
        )}

        {/* ---------------- STEP 2 — business ---------------- */}
        {step === 2 && (
          <div>
            <div className="w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-[#3b7bff]/15 to-[#d4af37]/15 border border-white/10 flex items-center justify-center text-2xl">
              💈
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Στοιχεία Καταστήματος</h1>
            <p className="text-[#8a97ac] text-sm mb-6 leading-relaxed">Θα φαίνονται στο δημόσιο προφίλ σου.</p>

            <div className="flex items-center gap-4 mb-5">
              <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 bg-[#0b1424] flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:border-[#3b7bff]">
                {logoPreview ? (
                  <img src={logoPreview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl opacity-60">🖼️</span>
                )}
                <input type="file" accept="image/*" onChange={onLogoSelect} className="hidden" />
              </label>
              <div className="text-sm">
                <div className="font-bold">Λογότυπο καταστήματος</div>
                <div className="text-[#8a97ac] text-xs mt-1">Τετράγωνη φωτογραφία για το προφίλ σου</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Όνομα καταστήματος</label>
              <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="π.χ. barberhood" className={inputCls} />
            </div>



            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Τηλέφωνο</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="69XXXXXXXX" className={inputCls} />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Διεύθυνση</label>
              <AddressAutocomplete onAddressChange={handleAddressChange} />
            </div>


          </div>
        )}

        {/* ---------------- STEP 3 — services ---------------- */}
        {step === 3 && (
          <div>
            <div className="w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-[#3b7bff]/15 to-[#d4af37]/15 border border-white/10 flex items-center justify-center text-2xl">
              ✂️
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Οι Υπηρεσίες σου</h1>
            <p className="text-[#8a97ac] text-sm mb-6 leading-relaxed">Πρόσθεσε τουλάχιστον μία υπηρεσία.</p>

            <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-4 mb-4">
              <div className="text-sm font-bold mb-3">➕ Προσθήκη Νέας Υπηρεσίας</div>
              <div className="flex gap-2 mb-3">
                <input value={newSvcName} onChange={(e) => setNewSvcName(e.target.value)} placeholder="Όνομα υπηρεσίας" className={`${inputCls} flex-[2]`} />
                <input value={newSvcPrice} onChange={(e) => setNewSvcPrice(e.target.value)} placeholder="€" type="number" className={`${inputCls} flex-1`} />
              </div>
              <button type="button" onClick={addService} className="w-full py-3 rounded-lg bg-gradient-to-br from-[#3b7bff] to-[#2a5fd9] font-bold text-sm">
                Προσθήκη Υπηρεσίας
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {services.map((s, i) => (
                <div key={i} className="flex justify-between items-center bg-[#0b1424] border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-sm">{s.name} — €{s.price}</span>
                  <button type="button" onClick={() => removeService(i)} className="text-[#ff5c72] text-sm px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- STEP 4 — hours ---------------- */}
        {step === 4 && (
          <div>
            <div className="w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-[#3b7bff]/15 to-[#d4af37]/15 border border-white/10 flex items-center justify-center text-2xl">
              🕒
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Ωράριο Λειτουργίας</h1>
            <p className="text-[#8a97ac] text-sm mb-6 leading-relaxed">Όρισε πότε είσαι διαθέσιμος.</p>

            {hours.map((h, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                <span className="font-bold text-sm w-10">{DAY_LABELS[i]}</span>
                {h.active ? (
                  <>
                    <input type="time" value={h.open} onChange={(e) => updateHour(i, 'open', e.target.value)} step={1800} className={timeInputCls} />
                    <span className="text-[#8a97ac] text-xs">–</span>
                    <input type="time" value={h.close} onChange={(e) => updateHour(i, 'close', e.target.value)} step={1800} className={timeInputCls} />
                  </>
                ) : (
                  <span className="text-[#8a97ac] text-sm">Κλειστά</span>
                )}
                <button
                  type="button"
                  onClick={() => toggleHour(i)}
                  className={`ml-auto w-9 h-5 rounded-full relative transition ${h.active ? 'bg-[#3b7bff]/40 border border-[#3b7bff]' : 'bg-[#16233f] border border-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${h.active ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ---------------- STEP 5 — photos ---------------- */}
        {step === 5 && (
          <div>
            <div className="w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-[#3b7bff]/15 to-[#d4af37]/15 border border-white/10 flex items-center justify-center text-2xl">
              📸
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Φωτογραφίες Καταστήματος</h1>
            <p className="text-[#8a97ac] text-sm mb-6 leading-relaxed">Τα προφίλ με φωτό δέχονται περισσότερα ραντεβού.</p>

            <label className="block border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-[#3b7bff] hover:bg-[#3b7bff]/10 mb-4">
              <div className="text-2xl mb-2">⬆️</div>
              <div className="text-sm font-bold">Πάτησε για μεταφόρτωση</div>
              <div className="text-xs text-[#8a97ac] mt-1"> PNG έως 6 φωτογραφίες</div>
              <input type="file" accept="image/*" multiple onChange={onPhotosSelect} className="hidden" />
            </label>

            <div className="grid grid-cols-3 gap-2">
              {photoPreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                  <img src={url} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px]">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- STEP 6 — review ---------------- */}
        {step === 6 && (
          <div>
            <div className="w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br from-[#3b7bff]/15 to-[#d4af37]/15 border border-white/10 flex items-center justify-center text-2xl">
              🚀
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Όλα Έτοιμα!</h1>
            <p className="text-[#8a97ac] text-sm mb-6 leading-relaxed">Έλεγξε τα στοιχεία σου πριν δημοσιεύσεις το προφίλ σου.</p>

            <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-4 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Κατάστημα</div>
              <div className="text-sm font-bold">{shopName || '—'}</div>
              <div className="text-xs text-[#8a97ac] mt-0.5">{street} {streetNumber}, {postalCode} {city}</div>
            </div>
            <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-4 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Ομάδα</div>
              <div className="text-sm font-bold">{teamSize} {teamSize === 1 ? 'barber' : 'barbers'}</div>
            </div>
            <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-4 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Υπηρεσίες</div>
              <div className="text-sm font-bold">{services.length} υπηρεσίες</div>
            </div>
            <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-4 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Ωράριο</div>
              <div className="text-sm font-bold">Ανοιχτά {hours.filter((h) => h.active).length} μέρες/εβδομάδα</div>
            </div>
            <div className="bg-[#0b1424] border border-white/10 rounded-2xl p-4 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#8a97ac] mb-1.5">Φωτογραφίες</div>
              <div className="text-sm font-bold">{photoFiles.length} φωτογραφίες</div>
            </div>
          </div>
        )}

        {/* ---------------- SUCCESS ---------------- */}
        {step > TOTAL_STEPS && (
          <div className="text-center pt-8">
            <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-[#3ecf8e] flex items-center justify-center text-4xl text-[#070c16]">
              ✓
            </div>
            <h1 className="text-2xl font-extrabold mb-2">Το προφίλ σου είναι live! 🎉</h1>
            <p className="text-[#8a97ac] text-sm mb-6">Το {shopName} είναι τώρα ορατό στους πελάτες.</p>

            <div className="bg-gradient-to-br from-[#3b7bff]/10 to-[#d4af37]/10 border border-[#3b7bff]/25 rounded-2xl p-5 text-left">
              <div className="text-sm font-bold mb-1">🔗 Το link κράτησής σου</div>
              <div className="text-xs text-[#8a97ac] mb-4">Βάλε το στο bio του Instagram — οδηγεί κατευθείαν στη σελίδα κράτησης.</div>
              <div className="flex gap-2 items-center bg-[#0b1424] border border-white/10 rounded-xl px-3 py-3 mb-3">
                <span className="text-sm font-bold text-[#cfe0ff] flex-1 truncate">{finalLink}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(`https://${finalLink}`)}
                  className="px-3 py-2 rounded-lg bg-[#3b7bff] text-white text-xs font-bold"
                >
                  Αντιγραφή
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-br from-[#3b7bff] to-[#2a5fd9] font-bold"
            >
              Μετάβαση στο Dashboard →
            </button>
          </div>
        )}
      </div>
  

      {/* ---------------- bottom bar ---------------- */}
      {step <= TOTAL_STEPS && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0b1424] border-t border-white/10 px-5 py-3.5">
          <div className="max-w-lg mx-auto flex gap-2.5">
            {step > 1 && (
              <button onClick={back} className="px-5 py-3.5 rounded-xl border border-white/10 bg-[#101c33] font-bold text-sm">
                ← Πίσω
              </button>
            )}
            <button
              onClick={next}
              disabled={!canNext() || loading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-br from-[#3b7bff] to-[#2a5fd9] font-bold text-sm disabled:opacity-40"
            >
              {loading ? 'Δημοσίευση...' : step === TOTAL_STEPS ? 'Δημοσίευση Καταστήματος 🚀' : 'Συνέχεια →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}