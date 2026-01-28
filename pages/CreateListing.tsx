import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { useNavigate, Navigate } from 'react-router-dom';
import { CATEGORIES, MALAYSIAN_STATES } from '../constants';
import toast from 'react-hot-toast';

const CreateListing: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState<string>('Panels');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [state, setState] = useState('Selangor');
  const [images, setImages] = useState<File[]>([]);
  
  // Dynamic Specs State
  const [specs, setSpecs] = useState<any>({});

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user && !user.is_verified) {
    toast.error("You must be verified to post.");
    return <Navigate to="/dashboard" />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 10) {
        toast.error("Max 10 images allowed");
        return;
      }
      setImages(filesArray);
    }
  };

  const handleSpecChange = (key: string, value: string | number) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length <= 80) {
          setTitle(val);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // In a real app, upload images here and get URLs
        // We'll mock image URLs
        const mockImageUrls = images.map(() => `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`);
        // If no images, use placeholder
        if(mockImageUrls.length === 0) mockImageUrls.push('https://via.placeholder.com/800x600?text=No+Image');

        // STRICT 30-DAY RULE: Active until and Archive until are the same.
        const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const listingData = {
            seller_id: user!.id,
            title,
            category: category as any,
            brand,
            specs,
            price_rm: parseFloat(price),
            location_state: state,
            images_url: mockImageUrls,
            active_until: expiryDate,
            archive_until: expiryDate,
            is_sold: false,
            is_hidden: false
        };

        await db.createListing(listingData);
        toast.success("Listing published successfully!");
        navigate('/dashboard');
    } catch (error) {
        toast.error("Failed to create listing.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // Helper calculation for Price/Watt
  const showPricePerWatt = category === 'Panels' && price && specs.wattage;
  const pricePerWatt = showPricePerWatt ? (parseFloat(price) / specs.wattage).toFixed(2) : null;

  // Render Dynamic Form Fields
  const renderSpecFields = () => {
    switch (category) {
      case 'Panels':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Wattage (W)" type="number" onChange={(v) => handleSpecChange('wattage', Number(v))} required />
              <Input label="Efficiency (%)" type="number" onChange={(v) => handleSpecChange('efficiency', Number(v))} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cell Type</label>
                  <select onChange={(e) => handleSpecChange('cell_type', e.target.value)} className="w-full border-slate-300 rounded-md border p-2 text-sm focus:ring-primary focus:border-primary">
                    <option value="">Select Type</option>
                    <option value="Monocrystalline">Monocrystalline</option>
                    <option value="Polycrystalline">Polycrystalline</option>
                    <option value="Thin-Film">Thin-Film</option>
                  </select>
               </div>
               <Input label="Dimensions (mm)" placeholder="e.g. 2279x1134x35" onChange={(v) => handleSpecChange('dimensions', v)} required />
            </div>
          </>
        );
      case 'Inverters':
        return (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phase</label>
                  <select onChange={(e) => handleSpecChange('phase', e.target.value)} className="w-full border-slate-300 rounded-md border p-2 text-sm focus:ring-primary focus:border-primary">
                    <option value="Single">Single Phase</option>
                    <option value="Three">Three Phase</option>
                  </select>
               </div>
               <Input label="Max Input Voltage (V)" type="number" onChange={(v) => handleSpecChange('max_input_voltage', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Efficiency (%)" type="number" onChange={(v) => handleSpecChange('efficiency', Number(v))} />
               <Input label="Warranty (Years)" type="number" onChange={(v) => handleSpecChange('warranty_years', Number(v))} />
             </div>
          </>
        );
      case 'Batteries':
        return (
            <>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Capacity (kWh)" type="number" onChange={(v) => handleSpecChange('capacity_kwh', Number(v))} />
               <Input label="Nominal Voltage (V)" type="number" onChange={(v) => handleSpecChange('nominal_voltage', Number(v))} />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Cycle Life" type="number" onChange={(v) => handleSpecChange('cycle_life', Number(v))} />
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technology</label>
                  <select onChange={(e) => handleSpecChange('technology', e.target.value)} className="w-full border-slate-300 rounded-md border p-2 text-sm focus:ring-primary focus:border-primary">
                    <option value="LiFePO4">LiFePO4</option>
                    <option value="Lead-Acid">Lead-Acid</option>
                    <option value="Other">Other</option>
                  </select>
               </div>
             </div>
          </>
        );
      default:
        return <p className="text-sm text-slate-500 italic">No specific fields for this category.</p>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">List New Equipment</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => { setCategory(e.target.value); setSpecs({}); }} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (State)</label>
                <select 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  {MALAYSIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>

          <div>
             <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Listing Title</label>
                <span className={`text-xs ${title.length >= 70 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                   {title.length}/80
                </span>
             </div>
             <input 
               type="text" 
               className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none transition-all"
               placeholder="e.g. JA Solar 550W Panel (Used)"
               required
               value={title}
               onChange={handleTitleChange}
             />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Brand" placeholder="e.g. Huawei, Jinko" value={brand} onChange={setBrand} required />
            <div>
                <Input label="Price (RM)" type="number" placeholder="0.00" value={price} onChange={setPrice} required />
                {showPricePerWatt && (
                    <p className="text-xs text-emerald-600 font-bold mt-1 text-right">
                       ≈ RM {pricePerWatt}/Watt
                    </p>
                )}
            </div>
          </div>
        </div>

        {/* Dynamic Specs */}
        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Technical Specifications</h2>
           <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
              {renderSpecFields()}
           </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">Images</h2>
           <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-slate-500">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop<br/>
                <span className="text-xs">Max 10 images. Formats: JPG, PNG.</span>
              </div>
           </div>
           {images.length > 0 && (
             <div className="text-sm text-slate-600">
               {images.length} file(s) selected
             </div>
           )}
        </div>

        <div className="pt-4">
           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70"
           >
             {loading ? 'Publishing...' : 'Publish Listing'}
           </button>
        </div>
      </form>
    </div>
  );
};

// Helper Input Component
const Input: React.FC<{
  label: string; 
  type?: string; 
  placeholder?: string; 
  required?: boolean;
  value?: string | number;
  onChange: (val: string) => void;
}> = ({ label, type = "text", placeholder, required, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      type={type} 
      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary outline-none transition-all"
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default CreateListing;